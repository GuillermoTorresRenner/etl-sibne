import fs from "fs";
import path from "path";
import { Pool } from "pg";
import sql from "mssql";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { nanoid } from "nanoid";

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de SQL Server
const sqlConfig = {
  user: "sa",
  password: process.env.SA_PASSWORD,
  server: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Configuración de archivos
const ARCHIVOS_PATH = process.env.BINARY_EXTRACTION_PATH || "./Archivos";

// Función para generar nombre de archivo
function generateFileName(originalName, extension) {
  const now = new Date();
  const fecha = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const nano = nanoid(8); // ID único de 8 caracteres

  // Limpiar extensión
  const ext = extension.startsWith(".") ? extension : `.${extension}`;

  return `${fecha}_${nano}${ext}`;
}

// Función para asegurar que existe el directorio de archivos
function ensureArchivosDirectory() {
  if (!fs.existsSync(ARCHIVOS_PATH)) {
    fs.mkdirSync(ARCHIVOS_PATH, { recursive: true });
    console.log(`📁 Directorio creado: ${ARCHIVOS_PATH}`);
  }
}

// Función para procesar archivos de SQL Server
async function processArchivoAdjunto() {
  let sqlPool;
  let pgClient;

  try {
    console.log("🔧 Procesando ArchivoAdjunto con extracción de archivos...\n");

    // Asegurar directorio existe
    ensureArchivosDirectory();

    // Conectar a SQL Server
    console.log("🔌 Conectando a SQL Server...");
    sqlPool = await sql.connect(sqlConfig);

    // Conectar a PostgreSQL
    console.log("🔌 Conectando a PostgreSQL...");
    pgClient = await pool.connect();

    // Extraer datos de SQL Server incluyendo FileData
    console.log("📊 Extrayendo datos de SQL Server...");
    const sqlQuery = `
      SELECT 
        Id,
        NombreArchivo,
        Tipo,
        Ext,
        FileData
      FROM dbo.ArchivoAdjunto
      ORDER BY Id
    `;

    const result = await sqlPool.request().query(sqlQuery);
    const records = result.recordset;

    console.log(`📋 Registros encontrados: ${records.length}`);

    if (records.length === 0) {
      console.log("⚠️  No hay registros para procesar");
      return;
    }

    // Truncar tabla en PostgreSQL
    await pgClient.query('TRUNCATE TABLE dbo."ArchivoAdjunto" CASCADE');
    console.log("🗑️  Tabla ArchivoAdjunto truncada en PostgreSQL");

    // Procesar cada registro
    const processedRecords = [];
    let filesExtracted = 0;
    let filesSkipped = 0;

    for (const record of records) {
      const { Id, NombreArchivo, Tipo, Ext, FileData } = record;

      let fileName = null;

      // Si hay FileData, extraer archivo
      if (FileData && FileData.length > 0) {
        try {
          fileName = generateFileName(NombreArchivo, Ext);
          const filePath = path.join(ARCHIVOS_PATH, fileName);

          // Escribir archivo binario
          fs.writeFileSync(filePath, FileData);
          filesExtracted++;

          console.log(
            `✅ Archivo extraído: ${fileName} (${FileData.length} bytes)`
          );
        } catch (error) {
          console.error(
            `❌ Error extrayendo archivo para ID ${Id}:`,
            error.message
          );
          filesSkipped++;
        }
      } else {
        filesSkipped++;
        console.log(`⚠️  ID ${Id}: Sin FileData, se omite extracción`);
      }

      // Preparar registro para PostgreSQL
      processedRecords.push({
        id: Id,
        nombreArchivo: NombreArchivo || "",
        tipo: Tipo || "",
        ext: Ext || "",
        fileName: fileName || "", // Usar nombre generado o vacío
      });
    }

    console.log(`\n📊 Resumen de extracción:`);
    console.log(`   - Archivos extraídos: ${filesExtracted}`);
    console.log(`   - Archivos omitidos: ${filesSkipped}`);
    console.log(`   - Total de registros: ${processedRecords.length}`);

    // Insertar en PostgreSQL
    console.log("\n💾 Insertando datos en PostgreSQL...");

    for (const record of processedRecords) {
      const insertQuery = `
        INSERT INTO dbo."ArchivoAdjunto" (id, "nombreArchivo", tipo, ext, "FileName")
        VALUES ($1, $2, $3, $4, $5)
      `;

      await pgClient.query(insertQuery, [
        record.id,
        record.nombreArchivo,
        record.tipo,
        record.ext,
        record.fileName,
      ]);
    }

    console.log(
      `✅ ${processedRecords.length} registros insertados en PostgreSQL`
    );

    // Verificación final
    const countResult = await pgClient.query(
      'SELECT COUNT(*) FROM dbo."ArchivoAdjunto"'
    );
    const totalRecords = countResult.rows[0].count;

    console.log(`\n🎉 ¡Proceso completado exitosamente!`);
    console.log(`   - Registros en PostgreSQL: ${totalRecords}`);
    console.log(`   - Archivos físicos extraídos: ${filesExtracted}`);
    console.log(`   - Directorio de archivos: ${path.resolve(ARCHIVOS_PATH)}`);

    // Mostrar algunos ejemplos
    if (processedRecords.length > 0) {
      console.log(`\n📋 Ejemplos de registros procesados:`);
      processedRecords.slice(0, 3).forEach((record) => {
        console.log(
          `   - ID ${record.id}: "${record.nombreArchivo}" → "${record.fileName}"`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error en el proceso:", error.message);
    throw error;
  } finally {
    // Cerrar conexiones
    if (sqlPool) {
      await sqlPool.close();
      console.log("🔌 Conexión SQL Server cerrada");
    }
    if (pgClient) {
      pgClient.release();
      console.log("🔌 Conexión PostgreSQL cerrada");
    }
    await pool.end();
  }
}

// Ejecutar si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  processArchivoAdjunto().catch((error) => {
    console.error("\n💥 ERROR CRÍTICO:", error.message);
    process.exit(1);
  });
}

// Exportar función principal
export default processArchivoAdjunto;
