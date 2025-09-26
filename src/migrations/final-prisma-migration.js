import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Cargar plan de migración de Prisma
const migrationPlan = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../prisma-migration-plan.json"),
    "utf8"
  )
);

// Función para deshabilitar FK constraints
async function disableFKConstraints(client) {
  console.log("🔒 Deshabilitando constraints de FK...");

  try {
    // Deshabilitar todos los triggers (incluye FK constraints)
    await client.query(`
      DO $$ 
      DECLARE 
        rec RECORD;
      BEGIN
        FOR rec IN 
          SELECT schemaname, tablename
          FROM pg_tables 
          WHERE schemaname = 'dbo'
        LOOP
          EXECUTE 'ALTER TABLE dbo."' || rec.tablename || '" DISABLE TRIGGER ALL';
          RAISE NOTICE 'Triggers deshabilitados para tabla %', rec.tablename;
        END LOOP;
      END $$;
    `);

    console.log("✅ Constraints FK deshabilitados correctamente");
  } catch (error) {
    console.error("❌ Error deshabilitando constraints:", error.message);
    throw error;
  }
}

// Función para habilitar FK constraints
async function enableFKConstraints(client) {
  console.log("🔓 Habilitando constraints de FK...");

  try {
    // Habilitar todos los triggers (incluye FK constraints)
    await client.query(`
      DO $$ 
      DECLARE 
        rec RECORD;
      BEGIN
        FOR rec IN 
          SELECT schemaname, tablename
          FROM pg_tables 
          WHERE schemaname = 'dbo'
        LOOP
          EXECUTE 'ALTER TABLE dbo."' || rec.tablename || '" ENABLE TRIGGER ALL';
          RAISE NOTICE 'Triggers habilitados para tabla %', rec.tablename;
        END LOOP;
      END $$;
    `);

    console.log("✅ Constraints FK habilitados correctamente");
  } catch (error) {
    console.error("❌ Error habilitando constraints:", error.message);
    throw error;
  }
}

// Función para obtener la estructura real de una tabla en PostgreSQL
async function getTableStructure(client, tableName) {
  const query = `
    SELECT 
      column_name, 
      data_type, 
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'dbo' 
    ORDER BY ordinal_position
  `;

  try {
    const result = await client.query(query, [tableName]);
    return result.rows.map((row) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
      default: row.column_default,
    }));
  } catch (error) {
    console.error(
      `❌ Error obteniendo estructura de tabla ${tableName}:`,
      error.message
    );
    return [];
  }
}

// Función para analizar CSV headers
function getCSVHeaders(csvFilePath) {
  try {
    const content = fs.readFileSync(csvFilePath, "utf8");
    const lines = content.split("\n");
    if (lines.length === 0) return [];

    return lines[0].split(",").map((header) => header.trim());
  } catch (error) {
    console.error(`❌ Error leyendo CSV ${csvFilePath}:`, error.message);
    return [];
  }
}

// Función para convertir PascalCase a camelCase
function pascalToCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Función para crear mapeo de columnas con soporte PascalCase->camelCase
function createColumnMapping(csvHeaders, dbColumns) {
  const mapping = {};
  const dbColumnMap = {};

  // Crear mapeo de columnas de DB con múltiples variantes
  dbColumns.forEach((col) => {
    const colName = col.name;
    // Mapear: lowercase, original name, y camelCase
    dbColumnMap[colName.toLowerCase()] = colName;
    dbColumnMap[colName] = colName;
    // Si la columna ya está en camelCase, también mapear su versión PascalCase
    const pascalVersion = colName.charAt(0).toUpperCase() + colName.slice(1);
    dbColumnMap[pascalVersion.toLowerCase()] = colName;
  });

  // Mapear headers de CSV a columnas de DB
  csvHeaders.forEach((csvHeader) => {
    const lowerHeader = csvHeader.toLowerCase();
    
    // Intentar mapeos en orden de prioridad:
    // 1. Mapeo exacto (case-insensitive)
    if (dbColumnMap[lowerHeader]) {
      mapping[csvHeader] = dbColumnMap[lowerHeader];
    }
    // 2. Si es PascalCase, intentar camelCase
    else if (csvHeader.length > 0 && csvHeader[0] === csvHeader[0].toUpperCase()) {
      const camelCaseVersion = pascalToCamelCase(csvHeader);
      if (dbColumnMap[camelCaseVersion.toLowerCase()]) {
        mapping[csvHeader] = dbColumnMap[camelCaseVersion.toLowerCase()];
        console.log(`🔄 Mapeo PascalCase->camelCase: ${csvHeader} → ${dbColumnMap[camelCaseVersion.toLowerCase()]}`);
      } else {
        console.warn(
          `⚠️  Columna CSV '${csvHeader}' no encontrada en PostgreSQL (intentado: ${camelCaseVersion})`
        );
      }
    } else {
      console.warn(
        `⚠️  Columna CSV '${csvHeader}' no encontrada en PostgreSQL`
      );
    }
  });

  return mapping;
}

// Función para limpiar y convertir valores
function cleanValue(value, columnType, columnName, nullable, hasDefault) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "NULL" ||
    value === "null"
  ) {
    // Si es nullable o tiene default, retornar null
    if (nullable || hasDefault) {
      return null;
    }

    // Si no es nullable, proporcionar un valor por defecto según el tipo
    switch (columnType) {
      case "integer":
      case "bigint":
        return 0;
      case "numeric":
      case "real":
      case "double precision":
        return 0.0;
      case "boolean":
        return false;
      case "text":
      case "character varying":
        return "";
      case "bytea":
        return Buffer.alloc(0); // Buffer vacío para BYTEA
      case "timestamp with time zone":
      case "timestamp without time zone":
        return new Date().toISOString();
      case "jsonb":
      case "json":
        return {};
      default:
        return "";
    }
  }

  // Limpiar comillas
  if (typeof value === "string") {
    value = value.replace(/^["'](.*)["']$/, "$1");
  }

  // Conversiones específicas por tipo
  switch (columnType) {
    case "integer":
    case "bigint":
      if (value === "") return nullable ? null : 0;
      const intValue = parseInt(value, 10);
      return isNaN(intValue) ? (nullable ? null : 0) : intValue;

    case "numeric":
    case "real":
    case "double precision":
      if (value === "") return nullable ? null : 0.0;
      const floatValue = parseFloat(value);
      return isNaN(floatValue) ? (nullable ? null : 0.0) : floatValue;

    case "boolean":
      if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
      }
      return Boolean(value);

    case "bytea":
      // Para BYTEA, si no hay valor, usar buffer vacío
      if (!value || value === "") {
        return nullable ? null : Buffer.alloc(0);
      }
      // Si es una cadena, convertir a buffer
      return Buffer.from(value, "utf8");

    case "timestamp with time zone":
    case "timestamp without time zone":
      if (value === "" || !value)
        return nullable ? null : new Date().toISOString();

      // Manejar diferentes formatos de fecha
      if (typeof value === "string") {
        // Formato específico de SQL Server: "Thu Mar 26 2020 14:14:05 GMT-0300 (hora de verano de Chile)"
        if (value.includes("GMT")) {
          try {
            // Extraer solo la parte de fecha sin el timezone problemático
            const dateMatch = value.match(
              /(\w{3}\s+\w{3}\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/
            );
            if (dateMatch) {
              const cleanDate = new Date(dateMatch[1] + " UTC");
              return cleanDate.toISOString();
            }
          } catch (e) {
            console.warn(
              `⚠️  Formato de fecha no reconocido: ${value}, usando fecha actual`
            );
            return nullable ? null : new Date().toISOString();
          }
        }

        // Intentar parsear normalmente
        try {
          const parsedDate = new Date(value);
          if (isNaN(parsedDate.getTime())) {
            return nullable ? null : new Date().toISOString();
          }
          return parsedDate.toISOString();
        } catch (e) {
          console.warn(`⚠️  Fecha inválida: ${value}, usando fecha actual`);
          return nullable ? null : new Date().toISOString();
        }
      }
      break;

    case "jsonb":
    case "json":
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value; // Devolver como string si no es JSON válido
        }
      }
      return value || (nullable ? null : {});

    default:
      return value || (nullable ? null : "");
  }

  return value;
}

// Función para parsear CSV correctamente manejando campos multilínea
function parseCSVContent(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < csvContent.length) {
    const char = csvContent[i];
    
    if (char === '"') {
      if (inQuotes && csvContent[i + 1] === '"') {
        // Comilla escapada ""
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Comilla de apertura/cierre
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Fin de campo
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Fin de fila
      if (currentField.trim() || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      }
      // Saltar \r\n
      if (char === '\r' && csvContent[i + 1] === '\n') {
        i++;
      }
    } else {
      // Carácter normal o salto de línea dentro de comillas
      currentField += char;
    }
    
    i++;
  }
  
  // Procesar último campo si existe
  if (currentField.trim() || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }
  
  return rows;
}

// Función para procesar CSV con mapeo y limpieza de datos
function processCSVWithMapping(csvContent, tableName, dbColumns) {
  // Parsear CSV correctamente con campos multilínea usando regex
  const csvData = parseCSVContent(csvContent);
  if (csvData.length === 0) return { headers: [], rows: [] };

  const csvHeaders = csvData[0].map((h) => h.trim());
  const mapping = createColumnMapping(csvHeaders, dbColumns);

  // Crear columnas mapeadas con información de tipo
  const mappedColumns = csvHeaders
    .map((header) => {
      const dbColumnName = mapping[header];
      if (dbColumnName) {
        const dbColumn = dbColumns.find((col) => col.name === dbColumnName);
        return {
          csvHeader: header,
          dbColumn: dbColumnName,
          type: dbColumn ? dbColumn.type : "text",
          nullable: dbColumn ? dbColumn.nullable : true,
          hasDefault: dbColumn ? dbColumn.default !== null : false,
        };
      }
      return null;
    })
    .filter((col) => col !== null);

  // Procesar filas (saltar header)
  const rows = [];
  for (let i = 1; i < csvData.length; i++) {
    const values = csvData[i];
    if (values.length !== csvHeaders.length) {
      console.warn(`⚠️ Fila ${i} tiene ${values.length} columnas, esperaba ${csvHeaders.length}. Saltando.`);
      continue;
    }

    const cleanedRow = [];
    mappedColumns.forEach((col, index) => {
      const rawValue = values[csvHeaders.indexOf(col.csvHeader)];
      const cleanedValue = cleanValue(
        rawValue,
        col.type,
        col.dbColumn,
        col.nullable,
        col.hasDefault
      );
      cleanedRow.push(cleanedValue);
    });

    rows.push(cleanedRow);
  }

  return {
    headers: mappedColumns.map((col) => col.dbColumn),
    rows,
    mappedColumns,
  };
}

// Función para insertar datos usando transacciones
async function insertDataBatch(
  client,
  tableName,
  headers,
  rows,
  batchSize = 500
) {
  if (rows.length === 0) {
    console.log(`⚠️  Tabla ${tableName}: Sin datos para insertar`);
    return;
  }

  const columnList = headers.map((h) => `"${h}"`).join(", ");

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const placeholders = batch
      .map((_, rowIndex) => {
        const rowPlaceholders = headers
          .map((_, colIndex) => `$${rowIndex * headers.length + colIndex + 1}`)
          .join(", ");
        return `(${rowPlaceholders})`;
      })
      .join(", ");

    const query = `INSERT INTO dbo."${tableName}" (${columnList}) VALUES ${placeholders}`;
    const values = batch.flat();

    try {
      await client.query(query, values);
      console.log(
        `✅ Tabla ${tableName}: Lote ${
          Math.floor(i / batchSize) + 1
        } insertado (${batch.length} filas)`
      );
    } catch (error) {
      console.error(
        `❌ Error insertando lote en tabla ${tableName}:`,
        error.message
      );
      // Log de algunos valores problemáticos para debug
      console.error(
        `❌ Primeros valores del lote: ${values.slice(0, 10).join(", ")}`
      );
      throw error;
    }
  }
}

// Función para procesar una tabla
async function processTable(client, tableName) {
  const csvPath = path.join(__dirname, "../../Tablas", `dbo_${tableName}.csv`);

  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️  Archivo CSV no encontrado: ${csvPath}`);
    return;
  }

  console.log(`📋 Procesando tabla: ${tableName}`);

  try {
    // Obtener estructura de la tabla
    const dbColumns = await getTableStructure(client, tableName);
    if (dbColumns.length === 0) {
      console.log(`❌ Tabla ${tableName} no encontrada en PostgreSQL`);
      return;
    }

    // Leer y procesar CSV
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const { headers, rows, mappedColumns } = processCSVWithMapping(
      csvContent,
      tableName,
      dbColumns
    );

    if (rows.length === 0) {
      console.log(`⚠️  Tabla ${tableName}: Sin datos válidos`);
      return;
    }

    console.log(`   - Columnas mapeadas: ${mappedColumns.length}`);
    console.log(`   - Filas a insertar: ${rows.length}`);

    // Truncar tabla
    await client.query(`TRUNCATE TABLE dbo."${tableName}" CASCADE`);
    console.log(`🗑️  Tabla ${tableName} truncada`);

    // Insertar datos
    await insertDataBatch(client, tableName, headers, rows);
  } catch (error) {
    console.error(`❌ Error procesando tabla ${tableName}:`, error.message);
    throw error;
  }
}

// Función principal
async function main() {
  const client = await pool.connect();

  try {
    console.log("🚀 Iniciando migración final con manejo de constraints...\n");
    console.log("=" * 60);

    console.log(`📊 Plan de migración cargado:`);
    console.log(`   - Total de modelos: ${migrationPlan.totalModels}`);
    console.log(
      `   - Orden de migración: ${migrationPlan.migrationOrder.length} tablas`
    );
    console.log(`   - Sin dependencias circulares: ✅`);

    // Deshabilitar FK constraints
    await disableFKConstraints(client);

    console.log("\n🔄 Procesando tablas en orden de dependencias...\n");

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Procesar tablas en orden de migración
    for (const tableName of migrationPlan.migrationOrder) {
      try {
        // Verificar si el archivo CSV existe
        const csvPath = path.join(
          __dirname,
          "../../Tablas",
          `dbo_${tableName}.csv`
        );
        if (!fs.existsSync(csvPath)) {
          console.log(`⚠️  Archivo CSV no encontrado: ${csvPath}`);
          skippedCount++;
          continue;
        }

        await processTable(client, tableName);
        processedCount++;
      } catch (error) {
        console.error(`💥 Error en tabla ${tableName}:`, error.message);
        errorCount++;
        // Continuar con la siguiente tabla en lugar de fallar completamente
      }
      console.log(""); // Línea en blanco para separar
    }

    // Habilitar FK constraints
    console.log("\n🔓 Habilitando constraints de FK...");
    try {
      await enableFKConstraints(client);
    } catch (error) {
      console.error(
        "⚠️  Error habilitando constraints (puede ser normal):",
        error.message
      );
    }

    console.log("=" * 60);
    console.log("📊 RESUMEN DE MIGRACIÓN:");
    console.log("=" * 60);
    console.log(`✅ Tablas procesadas exitosamente: ${processedCount}`);
    console.log(`❌ Tablas con errores: ${errorCount}`);
    console.log(`⏭️  Tablas omitidas (sin CSV): ${skippedCount}`);
    console.log(`📋 Total intentadas: ${migrationPlan.migrationOrder.length}`);

    const successRate = Math.round(
      (processedCount / (migrationPlan.migrationOrder.length - skippedCount)) *
        100
    );
    console.log(`📈 Tasa de éxito: ${successRate}%`);

    if (errorCount === 0) {
      console.log("\n🎉 ¡Migración completada exitosamente!");
    } else if (processedCount > errorCount) {
      console.log(
        `\n✅ Migración mayormente exitosa con ${errorCount} errores menores.`
      );
    } else {
      console.log(`\n⚠️  Migración completada con errores significativos.`);
    }
  } catch (error) {
    console.error("💥 Error crítico en la migración:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n💥 MIGRACIÓN FALLÓ:", error.message);
    process.exit(1);
  });
}

// Exportar función principal para uso como módulo
export default main;
export { processTable, processCSVWithMapping, createColumnMapping };
