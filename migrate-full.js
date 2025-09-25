#!/usr/bin/env node

/**
 * SIBNE ETL - Script de Migración Completa con Extracción
 *
 * Script realiza todo el proceso completo:
 * 1. Extrae datos desde SQL Server a CSV
 * 2. Analiza esquemas Prisma
 * 3. Ejecuta migración ordenada a PostgreSQL
 * 4. Procesa archivos binarios
 */

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import sql from "mssql";
import dotenv from "dotenv";
import { logger } from "./src/utils/logger.js";
import MigrationReportGenerator from "./src/scripts/generate-migration-report.js";

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

// Lista de tablas a extraer (en orden alfabético para simplificar)
const ALL_TABLES = [
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
  "Encuesta",
  "EncuestaEmpresa",
  "EncuestaPlanta",
  "Energetico",
  "EnergeticoGrupos",
  "EnergeticoUnidadMedida",
  "EstadoEmail",
  "EstadoEmpresa",
  "EstadoProceso",
  "EstadoReporte",
  "FactorConversion",
  "Formulario",
  "IntensidadEnergEncuestaEmpresa",
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
  "Users",
  "Usuario",
  "UsuarioLogin",
  "UsuarioRole",
  "UsuarioToken",
];

// � MAPEO DE NOMBRES DE TABLAS
// Mapeo de nombres Prisma (destino) -> nombres SQL Server (origen)
const TABLE_NAME_MAPPING = {
  "Usuario": "AspNetUsers",
  "Role": "AspNetRoles", 
  "UsuarioLogin": "AspNetUserLogins",
  "UsuarioToken": "AspNetUserTokens",
  // NOTA: UsuarioRole NO se incluye porque Prisma maneja la relación many-to-many automáticamente
  // Los datos de AspNetUserRoles se migran a través de la tabla implícita _UsuarioRoles que crea Prisma
};

// �🚧 TABLAS QUE NO EXISTEN EN LA BD ORIGINAL
// Estas tablas NO están en la base de datos de SQL Server
const DEV_TABLES_TO_EXCLUDE = [
  "Users", // Tabla obsoleta
  "Encuesta",
  "EncuestaEmpresa", 
  "EncuestaPlanta",
  "IntensidadEnergEncuestaEmpresa",
];

// Filtrar tablas que realmente existen en la BD original
const TABLES_TO_EXTRACT = ALL_TABLES.filter(
  (table) => !DEV_TABLES_TO_EXCLUDE.includes(table)
);

// Función para extraer tabla a CSV
async function extractTableToCSV(sqlPool, tableName) {
  try {
    // Usar el mapeo de nombres si existe, sino usar el nombre original
    const sourceTableName = TABLE_NAME_MAPPING[tableName] || tableName;
    const tableInfo = sourceTableName !== tableName ? `${tableName} (${sourceTableName})` : tableName;
    const query = `SELECT * FROM dbo.${sourceTableName}`;
    const result = await sqlPool.request().query(query);

    if (result.recordset.length === 0) {
      console.log(`⚠️  Tabla ${tableInfo}: Sin datos`);
      logger.warn(`Tabla ${tableInfo} sin datos`);
      return false;
    }

    // Crear CSV
    const headers = Object.keys(result.recordset[0]);
    const csvContent = [
      headers.join(","),
      ...result.recordset.map((row) =>
        headers
          .map((header) => {
            let value = row[header];
            // Manejar valores especiales
            if (value === null || value === undefined) {
              return "";
            }
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            if (value instanceof Date) {
              return value.toISOString();
            }
            if (Buffer.isBuffer(value)) {
              return ""; // Omitir binarios en CSV normal
            }
            return value.toString();
          })
          .join(",")
      ),
    ].join("\n");

    // Guardar archivo
    const csvPath = path.join(__dirname, "Tablas", `dbo_${tableName}.csv`);
    fs.writeFileSync(csvPath, csvContent, "utf8");

    console.log(
      `✅ ${tableInfo}: ${result.recordset.length} registros extraídos`
    );
    logger.info(
      `Tabla ${tableInfo} extraída: ${result.recordset.length} registros`
    );
    return true;
  } catch (error) {
    console.error(`❌ Error extrayendo tabla ${tableName}:`, error.message);
    logger.error(`Error extrayendo tabla ${tableName}`, error);
    return false;
  }
}

// Función principal
async function runFullMigration() {
  const startTime = Date.now();
  let sqlPool;

  try {
    const logMessage = "🚀 SIBNE ETL - MIGRACIÓN COMPLETA CON EXTRACCIÓN";
    console.log(logMessage);
    console.log("=".repeat(60));
    logger.info(logMessage);
    logger.info("Iniciando proceso de migración completa");

    // Mostrar información sobre tablas excluidas
    if (DEV_TABLES_TO_EXCLUDE.length > 0) {
      console.log(
        `\n🚧 Tablas de desarrollo excluidas: ${DEV_TABLES_TO_EXCLUDE.length}`
      );
      DEV_TABLES_TO_EXCLUDE.forEach((table) => {
        console.log(`   - ${table} (no existe en BD original)`);
      });
      logger.info(
        `Tablas de desarrollo excluidas: ${DEV_TABLES_TO_EXCLUDE.join(", ")}`
      );
    }

    // PASO 1: Conectar a SQL Server y extraer datos
    console.log("\n📊 PASO 1: Extrayendo datos desde SQL Server...\n");
    logger.info("PASO 1: Iniciando extracción de datos desde SQL Server");

    sqlPool = await sql.connect(sqlConfig);
    console.log("✅ Conectado a SQL Server");
    logger.info("Conexión establecida con SQL Server");

    let extractedCount = 0;
    let failedCount = 0;

    // Asegurar que existe la carpeta Tablas
    const tablasDir = path.join(__dirname, "Tablas");
    if (!fs.existsSync(tablasDir)) {
      fs.mkdirSync(tablasDir, { recursive: true });
    }

    // Extraer cada tabla
    for (const tableName of TABLES_TO_EXTRACT) {
      const success = await extractTableToCSV(sqlPool, tableName);
      if (success) {
        extractedCount++;
      } else {
        failedCount++;
      }
    }

    console.log(`\n📈 Extracción completada:`);
    console.log(`   ✅ Tablas extraídas: ${extractedCount}`);
    console.log(`   ❌ Tablas fallidas: ${failedCount}`);

    logger.info(
      `Extracción completada: ${extractedCount} exitosas, ${failedCount} fallidas`
    );

    // Cerrar conexión SQL Server
    await sqlPool.close();
    logger.info("Conexión SQL Server cerrada");

    // PASO 2: Analizar esquemas Prisma
    console.log("\n🔍 PASO 2: Analizando esquemas Prisma...\n");
    logger.info("PASO 2: Iniciando análisis de esquemas Prisma");

    const { default: analyzePrismaSchema } = await import(
      "./src/analyzers/analyze-prisma-schema.js"
    );
    // El analizador se ejecuta automáticamente al importarse
    logger.info("Análisis de esquemas Prisma completado");

    // PASO 3: Ejecutar migración a PostgreSQL
    console.log("\n🔄 PASO 3: Ejecutando migración a PostgreSQL...\n");
    logger.info("PASO 3: Iniciando migración a PostgreSQL");

    const { default: runPrismaMigration } = await import(
      "./src/migrations/final-prisma-migration.js"
    );
    await runPrismaMigration();
    logger.info("Migración a PostgreSQL completada");

    // PASO 4: Procesar archivos binarios
    console.log("\n📁 PASO 4: Procesando archivos binarios...\n");
    logger.info("PASO 4: Iniciando procesamiento de archivos binarios");

    const { default: extractArchivoAdjunto } = await import(
      "./src/processors/extract-archivo-adjunto.js"
    );
    await extractArchivoAdjunto();
    logger.info("Procesamiento de archivos binarios completado");

    // PASO 5: Generar reporte final
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log("\n📋 PASO 5: Generando reporte final...\n");
    logger.info("PASO 5: Generando reporte de migración");

    try {
      const reportGenerator = new MigrationReportGenerator();
      const reportPath = await reportGenerator.generateReport({
        extractedCount,
        failedCount,
        duration,
        totalTables: TABLES_TO_EXTRACT.length,
      });

      console.log(`✅ Reporte generado: ${reportPath}`);
      logger.info(`Reporte de migración generado en: ${reportPath}`);
    } catch (reportError) {
      console.error("⚠️  Error generando reporte:", reportError.message);
      logger.error("Error generando reporte:", reportError);
    }

    console.log("\n🎉 ¡MIGRACIÓN COMPLETA FINALIZADA EXITOSAMENTE!");
    console.log("=".repeat(60));
    console.log("📊 Resumen final:");
    console.log(`   - Tablas extraídas desde SQL Server: ${extractedCount}`);
    console.log("   - Esquemas Prisma analizados: ✅");
    console.log("   - Migración PostgreSQL: ✅");
    console.log("   - Archivos binarios procesados: ✅");
    console.log(`   - Duración total: ${duration} segundos`);

    logger.info(
      `Migración completa finalizada exitosamente en ${duration} segundos`
    );
    logger.info(
      `Resumen: ${extractedCount} tablas extraídas, ${failedCount} errores`
    );
  } catch (error) {
    console.error("\n💥 ERROR en la migración completa:", error.message);
    console.error("Stack trace:", error.stack);
    logger.error("Error crítico en migración completa", error);

    // Generar reporte de error
    try {
      const reportGenerator = new MigrationReportGenerator();
      const errorReportPath = await reportGenerator.generateErrorReport(error);
      console.log(`📋 Reporte de error generado: ${errorReportPath}`);
      logger.info(`Reporte de error generado en: ${errorReportPath}`);
    } catch (reportError) {
      logger.error("Error generando reporte de error:", reportError);
    }

    process.exit(1);
  } finally {
    if (sqlPool) {
      await sqlPool.close();
      logger.info("Conexión SQL Server cerrada en cleanup");
    }
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullMigration();
}

export default runFullMigration;
