#!/usr/bin/env node
/**
 * SIBNE ETL - main.js
 * Flujo unificado: 1) Extrae datos a CSV, 2) Analiza esquemas, 3) Migra robustamente a PostgreSQL, 4) Procesa binarios, 5) Genera reporte
 */

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import sql from "mssql";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
import { config } from "../config/database.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuración SQL Server ---
const sqlConfig = {
  user: config.sqlServer.user,
  password: config.sqlServer.password,
  server: config.sqlServer.server,
  port: config.sqlServer.port,
  database: config.sqlServer.database,
  options: config.sqlServer.options,
};

// --- Tablas a extraer y mapeo ---
const ALL_TABLES = [
  "ArchivoAdjunto","CargaMasivaArchivo","CargaMasivaDetalle","CargaMasivaError","CategoriaTransaccion","Comuna","Contacto","EmailConfig","EmailLogs","Empresa","Encuesta","EncuestaEmpresa","EncuestaPlanta","Energetico","EnergeticoGrupos","EnergeticoUnidadMedida","EstadoEmail","EstadoEmpresa","EstadoProceso","EstadoReporte","FactorConversion","Formulario","IntensidadEnergEncuestaEmpresa","Pais","Planta","Provincia","Region","Reporte","Role","SectorEconomico","SectorEconomicoSii","SectorEnergetico","SubSectorEconomico","Tecnologia","TipoContacto","TipoOtroUso","TipoPerdida","TipoTransporte","TipoUsoProceso","Transaccion","TransaccionIntensidadEnergia","UnidadMedida","Usuario","UsuarioLogin","UsuarioRole","UsuarioToken"
];
const TABLE_NAME_MAPPING = {
  Usuario: "AspNetUsers",
  Role: "AspNetRoles",
  UsuarioRole: "AspNetUserRoles",
  UsuarioLogin: "AspNetUserLogins",
  UsuarioToken: "AspNetUserTokens",
};
const DEV_TABLES_TO_EXCLUDE = [];
const TABLES_TO_EXTRACT = ALL_TABLES.filter((table) => !DEV_TABLES_TO_EXCLUDE.includes(table));

// --- Extracción de tabla a CSV (adaptado de migrate-full.js) ---
async function extractTableToCSV(sqlPool, tableName) {
  try {
    const sourceTableName = TABLE_NAME_MAPPING[tableName] || tableName;
    const tableInfo = sourceTableName !== tableName ? `${tableName} (${sourceTableName})` : tableName;
    const query = `SELECT * FROM dbo.${sourceTableName}`;
    const result = await sqlPool.request().query(query);

    if (result.recordset.length === 0) {
      console.log(`⏭️  Tabla ${tableInfo}: Sin datos (omitida)`);
      logger.info(`Tabla ${tableInfo} sin datos - omitida correctamente`);
      return "empty";
    }

    // Crear CSV
    const headers = Object.keys(result.recordset[0]);
    const csvContent = [
      headers.join(","),
      ...result.recordset.map((row) =>
        headers
          .map((header) => {
            let value = row[header];
            if (value === null || value === undefined) return "";
            if (value instanceof Date) value = value.toISOString();
            else if (Buffer.isBuffer(value)) return "";
            else value = value.toString();
            if (typeof value === "string") {
              let escapedValue = value.replace(/"/g, '""');
              if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
                return `"${escapedValue}"`;
              }
              return escapedValue;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Guardar archivo en la carpeta raíz Tablas/
    const csvPath = path.join(__dirname, "../../Tablas", `dbo_${tableName}.csv`);
    fs.writeFileSync(csvPath, csvContent, "utf8");

    console.log(`✅ ${tableInfo}: ${result.recordset.length} registros extraídos`);
    logger.info(`Tabla ${tableInfo} extraída: ${result.recordset.length} registros`);
    return "success";
  } catch (error) {
    console.error(`❌ Error extrayendo tabla ${tableName}:`, error.message);
    logger.error(`Error extrayendo tabla ${tableName}`, error);
    return "error";
  }
}

// --- Extracción de todas las tablas ---
async function extractAllTablesToCSV() {
  let sqlPool;
  let extractedCount = 0, emptyTablesCount = 0, failedCount = 0;
  try {
    sqlPool = await sql.connect(sqlConfig);
    // Asegurar carpeta Tablas
    const tablasDir = path.join(__dirname, "../../Tablas");
    if (!fs.existsSync(tablasDir)) fs.mkdirSync(tablasDir, { recursive: true });

    for (const tableName of TABLES_TO_EXTRACT) {
      const result = await extractTableToCSV(sqlPool, tableName);
      if (result === "success") extractedCount++;
      else if (result === "empty") emptyTablesCount++;
      else failedCount++;
    }
    await sqlPool.close();
    return { extractedCount, emptyTablesCount, failedCount };
  } catch (error) {
    if (sqlPool) await sqlPool.close();
    throw error;
  }
}

// --- Main unificado ---
async function main() {
  const startTime = Date.now();
  try {
    console.log("🚀 SIBNE ETL - FLUJO UNIFICADO");
    console.log("=".repeat(60));
    logger.info("Iniciando flujo unificado de migración");

    // 1. Extracción de datos a CSV
    console.log("\n📊 PASO 1: Extrayendo datos desde SQL Server a CSV...");
    const { extractedCount, emptyTablesCount, failedCount } = await extractAllTablesToCSV();
    console.log(`   ✅ Tablas extraídas con datos: ${extractedCount}`);
    console.log(`   ⏭️  Tablas omitidas (sin datos): ${emptyTablesCount}`);
    if (failedCount > 0) console.log(`   ❌ Tablas con errores: ${failedCount}`);
    logger.info(`Extracción completada: ${extractedCount} exitosas, ${emptyTablesCount} vacías, ${failedCount} con errores`);

    // 2. Analizar esquemas Prisma
    console.log("\n🔍 PASO 2: Analizando esquemas Prisma...");
    const { default: analyzePrismaSchema } = await import("../analyzers/analyze-prisma-schema.js");
    await analyzePrismaSchema();
    logger.info("Análisis de esquemas Prisma completado");

    // 3. Migración robusta a PostgreSQL
    console.log("\n🔄 PASO 3: Migrando datos a PostgreSQL (robusto)...");
    const { default: runFinalPrismaMigration } = await import("../migrations/final-prisma-migration.js");
    await runFinalPrismaMigration();

    logger.info("Migración robusta a PostgreSQL completada");

    // 4. Procesar archivos binarios
    console.log("\n📁 PASO 4: Procesando archivos binarios...");
    const { default: extractArchivoAdjunto } = await import("../processors/extract-archivo-adjunto.js");
    await extractArchivoAdjunto();
    logger.info("Procesamiento de archivos binarios completado");

    // 5. Generar reporte final
    console.log("\n📋 PASO 5: Generando reporte final...");
    const MigrationReportGenerator = (await import("./generate-migration-report.js")).default;
    const duration = Math.round((Date.now() - startTime) / 1000);
    try {
      const reportGenerator = new MigrationReportGenerator();
      const reportPath = await reportGenerator.generateReport({
        extractedCount,
        emptyTablesCount,
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
    logger.info("Migración completa finalizada exitosamente");
  } catch (error) {
    console.error("\n💥 ERROR en el flujo unificado:", error.message);
    console.error("Stack trace:", error.stack);
    logger.error("Error crítico en flujo unificado", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;



