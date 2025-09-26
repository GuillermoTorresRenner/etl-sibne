/**
 * Script para comparar la cantidad de registros entre las bases de datos
 * de origen (SQL Server) y destino (PostgreSQL)
 */

import sql from "mssql";
import { Client } from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuraciones de base de datos
const sqlConfig = {
  user: "sa",
  password: process.env.SA_PASSWORD,
  server: process.env.SQL_HOST || "localhost",
  port: parseInt(process.env.SQL_PORT) || 1433,
  database: process.env.DB_NAME || "SIBNE_ETL",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const pgConfig = {
  user: process.env.PG_USER || "sibne",
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || "sibne",
};

// Lista de tablas a comparar
const TABLES_TO_COMPARE = [
  "ArchivoAdjunto",
  "CargaMasivaArchivo",
  "CargaMasivaDetalle",
  "CargaMasivaError",
  "CategoriaTransaccion",
  "Comuna",
  "Contacto",
  "EmailConfig",
  "EmailLogs",
  "Empresa",
  "Energetico",
  "EnergeticoGrupos",
  "EnergeticoUnidadMedida",
  "EstadoEmail",
  "EstadoEmpresa",
  "EstadoProceso",
  "EstadoReporte",
  "FactorConversion",
  "Formulario",
  "Pais",
  "Planta",
  "Provincia",
  "Region",
  "Reporte",
  "Role",
  "SectorEconomico",
  "SectorEconomicoSii",
  "SectorEnergetico",
  "SubSectorEconomico",
  "Tecnologia",
  "TipoContacto",
  "TipoOtroUso",
  "TipoPerdida",
  "TipoTransporte",
  "TipoUsoProceso",
  "Transaccion",
  "TransaccionIntensidadEnergia",
  "UnidadMedida",
  "Usuario",
  "UsuarioRole",
];

// Mapeo de nombres de tablas (SQL Server -> PostgreSQL)
const TABLE_NAME_MAPPING = {
  ArchivoAdjunto: "ArchivoAdjunto",
  CargaMasivaArchivo: "CargaMasivaArchivo",
  CargaMasivaDetalle: "CargaMasivaDetalle",
  CargaMasivaError: "CargaMasivaError",
  CategoriaTransaccion: "CategoriaTransaccion",
  Comuna: "Comuna",
  Contacto: "Contacto",
  EmailConfig: "EmailConfig",
  EmailLogs: "EmailLogs",
  Empresa: "Empresa",
  Energetico: "Energetico",
  EnergeticoGrupos: "EnergeticoGrupos",
  EnergeticoUnidadMedida: "EnergeticoUnidadMedida",
  EstadoEmail: "EstadoEmail",
  EstadoEmpresa: "EstadoEmpresa",
  EstadoProceso: "EstadoProceso",
  EstadoReporte: "EstadoReporte",
  FactorConversion: "FactorConversion",
  Formulario: "Formulario",
  Pais: "Pais",
  Planta: "Planta",
  Provincia: "Provincia",
  Region: "Region",
  Reporte: "Reporte",
  Role: "Role",
  SectorEconomico: "SectorEconomico",
  SectorEconomicoSii: "SectorEconomicoSii",
  SectorEnergetico: "SectorEnergetico",
  SubSectorEconomico: "SubSectorEconomico",
  Tecnologia: "Tecnologia",
  TipoContacto: "TipoContacto",
  TipoOtroUso: "TipoOtroUso",
  TipoPerdida: "TipoPerdida",
  TipoTransporte: "TipoTransporte",
  TipoUsoProceso: "TipoUsoProceso",
  Transaccion: "Transaccion",
  TransaccionIntensidadEnergia: "TransaccionIntensidadEnergia",
  UnidadMedida: "UnidadMedida",
  Usuario: "Usuario",
  UsuarioRole: "UsuarioRole",
};

/**
 * Obtener lista de tablas desde SQL Server
 */
async function getTablesSQLServer(sqlPool) {
  try {
    const query = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;
    const result = await sqlPool.request().query(query);
    return result.recordset.map((row) => row.TABLE_NAME);
  } catch (error) {
    console.error("❌ Error obteniendo tablas de SQL Server:", error.message);
    return [];
  }
}

/**
 * Obtener lista de tablas desde PostgreSQL
 */
async function getTablesPostgreSQL(pgClient) {
  try {
    const query = `
      SELECT tablename, schemaname
      FROM pg_tables 
      WHERE schemaname IN ('public', 'dbo')
      ORDER BY schemaname, tablename
    `;
    const result = await pgClient.query(query);

    // Mostrar información de esquemas encontrados
    const schemaInfo = result.rows.reduce((acc, row) => {
      if (!acc[row.schemaname]) acc[row.schemaname] = 0;
      acc[row.schemaname]++;
      return acc;
    }, {});

    console.log("📊 Esquemas encontrados en PostgreSQL:");
    Object.entries(schemaInfo).forEach(([schema, count]) => {
      console.log(`   - ${schema}: ${count} tablas`);
    });

    return result.rows.map((row) => row.tablename);
  } catch (error) {
    console.error("❌ Error obteniendo tablas de PostgreSQL:", error.message);
    return [];
  }
}

/**
 * Obtener cantidad de registros de una tabla en SQL Server
 */
async function getTableCountSQLServer(sqlPool, tableName) {
  try {
    const query = `SELECT COUNT(*) as count FROM dbo.${tableName}`;
    const result = await sqlPool.request().query(query);
    return result.recordset[0].count;
  } catch (error) {
    console.error(
      `❌ Error contando tabla ${tableName} en SQL Server:`,
      error.message
    );
    return -1; // Indica error
  }
}

/**
 * Obtener el esquema de una tabla en PostgreSQL
 */
async function getTableSchema(pgClient, tableName) {
  try {
    const query = `
      SELECT schemaname 
      FROM pg_tables 
      WHERE tablename = $1 
      AND schemaname IN ('public', 'dbo')
      LIMIT 1
    `;
    const result = await pgClient.query(query, [tableName]);
    return result.rows.length > 0 ? result.rows[0].schemaname : "public";
  } catch (error) {
    return "public"; // Default fallback
  }
}

/**
 * Obtener cantidad de registros de una tabla en PostgreSQL
 */
async function getTableCountPostgreSQL(pgClient, tableName) {
  try {
    // Determinar el esquema correcto de la tabla
    const schema = await getTableSchema(pgClient, tableName);
    const query = `SELECT COUNT(*) as count FROM "${schema}"."${tableName}"`;
    const result = await pgClient.query(query);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error(
      `❌ Error contando tabla ${tableName} en PostgreSQL:`,
      error.message
    );
    return -1; // Indica error
  }
}

/**
 * Comparar bases de datos
 */
async function compareDatabases() {
  let sqlPool;
  let pgClient;

  try {
    console.log("🔍 COMPARACIÓN DE BASES DE DATOS");
    console.log("================================");
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log("");

    // Conectar a SQL Server
    console.log("🔌 Conectando a SQL Server...");
    sqlPool = await sql.connect(sqlConfig);
    console.log("✅ Conectado a SQL Server");

    // Conectar a PostgreSQL
    console.log("🔌 Conectando a PostgreSQL...");
    pgClient = new Client(pgConfig);
    await pgClient.connect();
    console.log("✅ Conectado a PostgreSQL");

    // Obtener listas de tablas
    console.log("\n🔍 Detectando tablas en ambas bases de datos...");
    const sqlTables = await getTablesSQLServer(sqlPool);
    const pgTables = await getTablesPostgreSQL(pgClient);

    console.log(`� Tablas en SQL Server: ${sqlTables.length}`);
    console.log(`📊 Tablas en PostgreSQL: ${pgTables.length}`);

    // Encontrar tablas comunes y diferencias
    const commonTables = sqlTables.filter((table) => pgTables.includes(table));
    const sqlOnlyTables = sqlTables.filter(
      (table) => !pgTables.includes(table)
    );
    const pgOnlyTables = pgTables.filter((table) => !sqlTables.includes(table));

    console.log(`📊 Tablas comunes: ${commonTables.length}`);
    console.log(`📊 Solo en SQL Server: ${sqlOnlyTables.length}`);
    console.log(`📊 Solo en PostgreSQL: ${pgOnlyTables.length}`);

    console.log("\n�📋 COMPARANDO TABLAS COMUNES:");
    console.log("═".repeat(80));

    const results = [];
    let totalSQLServer = 0;
    let totalPostgreSQL = 0;
    let perfectMatches = 0;
    let differences = 0;
    let errors = 0;

    // Comparar tablas comunes
    for (const tableName of commonTables) {
      process.stdout.write(`📄 ${tableName.padEnd(30)}`);

      const [sqlCount, pgCount] = await Promise.all([
        getTableCountSQLServer(sqlPool, tableName),
        getTableCountPostgreSQL(pgClient, tableName),
      ]);

      let status = "";
      let statusIcon = "";

      if (sqlCount === -1 || pgCount === -1) {
        status = "ERROR";
        statusIcon = "❌";
        errors++;
      } else if (sqlCount === pgCount) {
        status = "MATCH";
        statusIcon = "✅";
        perfectMatches++;
        totalSQLServer += sqlCount;
        totalPostgreSQL += pgCount;
      } else {
        status = "DIFF";
        statusIcon = "⚠️";
        differences++;
        totalSQLServer += sqlCount;
        totalPostgreSQL += pgCount;
      }

      const result = {
        tableName,
        sqlServerCount: sqlCount,
        postgresCount: pgCount,
        status,
        difference: sqlCount >= 0 && pgCount >= 0 ? sqlCount - pgCount : null,
      };

      results.push(result);

      console.log(
        ` ${statusIcon} SQL: ${sqlCount.toString().padStart(6)} | PG: ${pgCount
          .toString()
          .padStart(6)} | ${status}`
      );
    }

    // Mostrar resumen
    console.log("\n" + "═".repeat(80));
    console.log("📊 RESUMEN DE COMPARACIÓN");
    console.log("═".repeat(80));
    console.log(`✅ Tablas coincidentes:     ${perfectMatches}`);
    console.log(`⚠️  Tablas con diferencias: ${differences}`);
    console.log(`❌ Tablas con errores:      ${errors}`);
    console.log(
      `📊 Total SQL Server:        ${totalSQLServer.toLocaleString()}`
    );
    console.log(
      `📊 Total PostgreSQL:        ${totalPostgreSQL.toLocaleString()}`
    );
    console.log(
      `📊 Diferencia total:        ${(
        totalSQLServer - totalPostgreSQL
      ).toLocaleString()}`
    );

    // Mostrar tablas con diferencias
    const tablesWithDifferences = results.filter((r) => r.status === "DIFF");
    if (tablesWithDifferences.length > 0) {
      console.log("\n⚠️  TABLAS CON DIFERENCIAS:");
      console.log("═".repeat(80));
      tablesWithDifferences.forEach((table) => {
        const diff = table.difference;
        const diffText = diff > 0 ? `+${diff}` : diff.toString();
        console.log(
          `📄 ${table.tableName.padEnd(30)} | SQL: ${table.sqlServerCount
            .toString()
            .padStart(6)} | PG: ${table.postgresCount
            .toString()
            .padStart(6)} | Diff: ${diffText}`
        );
      });
    }

    // Mostrar tablas con errores
    const tablesWithErrors = results.filter((r) => r.status === "ERROR");
    if (tablesWithErrors.length > 0) {
      console.log("\n❌ TABLAS CON ERRORES:");
      console.log("═".repeat(80));
      tablesWithErrors.forEach((table) => {
        console.log(`📄 ${table.tableName.padEnd(30)} | Error en consulta`);
      });
    }

    // Mostrar tablas solo en SQL Server
    if (sqlOnlyTables.length > 0) {
      console.log("\n📋 TABLAS SOLO EN SQL SERVER:");
      console.log("═".repeat(80));
      sqlOnlyTables.forEach((table) => {
        console.log(`📄 ${table.padEnd(30)} | No migrada a PostgreSQL`);
      });
    }

    // Mostrar tablas solo en PostgreSQL
    if (pgOnlyTables.length > 0) {
      console.log("\n📋 TABLAS SOLO EN POSTGRESQL:");
      console.log("═".repeat(80));
      pgOnlyTables.forEach((table) => {
        console.log(`📄 ${table.padEnd(30)} | No existe en SQL Server`);
      });
    }

    // Generar reporte en archivo
    await generateComparisonReport(results, {
      perfectMatches,
      differences,
      errors,
      totalSQLServer,
      totalPostgreSQL,
      commonTablesCount: commonTables.length,
      sqlOnlyTables,
      pgOnlyTables,
    });

    console.log("\n🎯 RECOMENDACIONES:");
    console.log("═".repeat(80));

    if (differences === 0 && errors === 0) {
      console.log("🎉 ¡Excelente! Todas las tablas coinciden perfectamente.");
    } else {
      if (differences > 0) {
        console.log(`⚠️  Revisar las ${differences} tablas con diferencias`);
        console.log("   - Verificar si hay datos faltantes en PostgreSQL");
        console.log("   - Revisar logs de migración para errores específicos");
      }
      if (errors > 0) {
        console.log(`❌ Resolver los ${errors} errores de consulta`);
        console.log("   - Verificar que las tablas existan en ambas bases");
        console.log("   - Revisar permisos de acceso");
      }
    }

    console.log(
      "\n📄 Reporte detallado guardado en: Reportes/comparison-report.md"
    );
  } catch (error) {
    console.error("❌ Error durante la comparación:", error);
  } finally {
    // Cerrar conexiones
    if (sqlPool) {
      await sqlPool.close();
      console.log("\n🔌 Desconectado de SQL Server");
    }
    if (pgClient) {
      await pgClient.end();
      console.log("🔌 Desconectado de PostgreSQL");
    }
  }
}

/**
 * Generar reporte de comparación en archivo Markdown
 */
async function generateComparisonReport(results, summary) {
  try {
    const reportDir = path.join(process.cwd(), "Reportes");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, "comparison-report.md");
    const timestamp = new Date().toLocaleString();

    let report = `# Reporte de Comparación de Bases de Datos

**Fecha:** ${timestamp}  
**Tablas comunes analizadas:** ${results.length}

## Resumen Ejecutivo

| Métrica | Valor |
|---------|--------|
| 📊 Tablas comunes | ${summary.commonTablesCount || results.length} |
| ✅ Tablas coincidentes | ${summary.perfectMatches} |
| ⚠️ Tablas con diferencias | ${summary.differences} |
| ❌ Tablas con errores | ${summary.errors} |
| 📋 Solo en SQL Server | ${summary.sqlOnlyTables?.length || 0} |
| 📋 Solo en PostgreSQL | ${summary.pgOnlyTables?.length || 0} |
| 📊 Total registros SQL Server | ${summary.totalSQLServer.toLocaleString()} |
| 📊 Total registros PostgreSQL | ${summary.totalPostgreSQL.toLocaleString()} |
| 📊 Diferencia total | ${(
      summary.totalSQLServer - summary.totalPostgreSQL
    ).toLocaleString()} |

## Detalle por Tabla

| Tabla | SQL Server | PostgreSQL | Estado | Diferencia |
|-------|------------|------------|--------|------------|
`;

    results.forEach((table) => {
      const statusIcon =
        table.status === "MATCH" ? "✅" : table.status === "DIFF" ? "⚠️" : "❌";
      const diff = table.difference !== null ? table.difference : "N/A";
      report += `| ${table.tableName} | ${table.sqlServerCount} | ${table.postgresCount} | ${statusIcon} ${table.status} | ${diff} |\n`;
    });

    // Agregar sección de tablas con diferencias
    const tablesWithDiff = results.filter((r) => r.status === "DIFF");
    if (tablesWithDiff.length > 0) {
      report += `\n## ⚠️ Tablas con Diferencias (${tablesWithDiff.length})\n\n`;
      tablesWithDiff.forEach((table) => {
        const diff = table.difference;
        const action =
          diff > 0
            ? "faltan registros en PostgreSQL"
            : "registros extra en PostgreSQL";
        report += `- **${table.tableName}**: ${Math.abs(diff)} ${action}\n`;
      });
    }

    // Agregar sección de tablas con errores
    const tablesWithErrors = results.filter((r) => r.status === "ERROR");
    if (tablesWithErrors.length > 0) {
      report += `\n## ❌ Tablas con Errores (${tablesWithErrors.length})\n\n`;
      tablesWithErrors.forEach((table) => {
        report += `- **${table.tableName}**: Error en consulta\n`;
      });
    }

    // Agregar sección de tablas solo en SQL Server
    if (summary.sqlOnlyTables && summary.sqlOnlyTables.length > 0) {
      report += `\n## 📋 Tablas Solo en SQL Server (${summary.sqlOnlyTables.length})\n\n`;
      report += `Estas tablas existen en SQL Server pero no han sido migradas a PostgreSQL:\n\n`;
      summary.sqlOnlyTables.forEach((table) => {
        report += `- **${table}**: No migrada\n`;
      });
    }

    // Agregar sección de tablas solo en PostgreSQL
    if (summary.pgOnlyTables && summary.pgOnlyTables.length > 0) {
      report += `\n## 📋 Tablas Solo en PostgreSQL (${summary.pgOnlyTables.length})\n\n`;
      report += `Estas tablas existen en PostgreSQL pero no en SQL Server:\n\n`;
      summary.pgOnlyTables.forEach((table) => {
        report += `- **${table}**: Nueva tabla\n`;
      });
    }

    report += `\n## Recomendaciones\n\n`;

    if (summary.differences === 0 && summary.errors === 0) {
      report += `🎉 **¡Excelente!** Todas las tablas coinciden perfectamente.\n\n`;
    } else {
      if (summary.differences > 0) {
        report += `### Diferencias en Datos\n`;
        report += `- Revisar las ${summary.differences} tablas con diferencias\n`;
        report += `- Verificar si hay datos faltantes en PostgreSQL\n`;
        report += `- Revisar logs de migración para errores específicos\n\n`;
      }
      if (summary.errors > 0) {
        report += `### Errores de Consulta\n`;
        report += `- Resolver los ${summary.errors} errores de consulta\n`;
        report += `- Verificar que las tablas existan en ambas bases\n`;
        report += `- Revisar permisos de acceso\n\n`;
      }
    }

    report += `## Comandos Útiles\n\n`;
    report += `\`\`\`bash\n`;
    report += `# Ejecutar comparación nuevamente\n`;
    report += `npm run compare-db\n\n`;
    report += `# Ver logs de migración\n`;
    report += `tail -f logs/etl-combined.log\n\n`;
    report += `# Ejecutar migración completa\n`;
    report += `npm run migrate\n`;
    report += `\`\`\`\n`;

    fs.writeFileSync(reportPath, report, "utf8");
    console.log(`📄 Reporte guardado en: ${reportPath}`);
  } catch (error) {
    console.error("❌ Error generando reporte:", error);
  }
}

// Ejecutar comparación
if (import.meta.url === `file://${process.argv[1]}`) {
  compareDatabases();
}

export { compareDatabases };
