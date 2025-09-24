#!/usr/bin/env node

/**
 * Script para extraer archivos binarios de SQL Server
 * y preparar la migración hacia arquitectura moderna
 */

import { SqlServerExtractor } from "../extractors/sqlserver-extractor.js";
import { BinaryExtractor } from "../utils/binary-extractor.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/database.js";

async function extractBinaryFiles() {
  logger.info("🚀 INICIANDO EXTRACCIÓN DE ARCHIVOS BINARIOS");
  logger.info("==============================================");

  const sqlExtractor = new SqlServerExtractor();
  let binaryExtractor;

  try {
    // Conectar a SQL Server
    await sqlExtractor.connect();

    // Crear extractor de binarios
    const extractPath = process.env.BINARY_EXTRACTION_PATH || "Archivos";
    binaryExtractor = new BinaryExtractor(sqlExtractor.pool, extractPath);

    // Extraer archivos de ArchivoAdjunto
    logger.info("📁 Extrayendo archivos de dbo.ArchivoAdjunto...");
    const extractedFiles = await binaryExtractor.extractBinaryFiles(
      "dbo.ArchivoAdjunto",
      "FileData"
    );

    // Generar script SQL de migración
    logger.info("📝 Generando script SQL de migración...");
    const sqlScript = await binaryExtractor.generateMigrationSQL(
      extractedFiles,
      "dbo.ArchivoAdjunto"
    );

    // Generar manifest de migración
    logger.info("📋 Generando manifest de migración...");
    const manifest = await binaryExtractor.generateMigrationManifest(
      extractedFiles,
      "dbo.ArchivoAdjunto"
    );

    // Resumen final
    logger.info("");
    logger.info("✅ EXTRACCIÓN COMPLETADA EXITOSAMENTE");
    logger.info("=====================================");
    logger.info(`📁 Archivos extraídos: ${extractedFiles.length}`);
    logger.info(
      `💾 Tamaño total: ${(
        extractedFiles.reduce((sum, f) => sum + f.tamano, 0) /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    logger.info(`📝 Script SQL: ${sqlScript}`);
    logger.info(`📋 Manifest: ${manifest}`);
    logger.info("");
    logger.info("🔄 PRÓXIMOS PASOS:");
    logger.info(`1. Revisar archivos extraídos en ./${extractPath}/`);
    logger.info("2. Configurar storage en el nuevo backend (S3/Azure/Local)");
    logger.info("3. Ejecutar script SQL para crear tabla sin binarios");
    logger.info("4. Implementar endpoints de upload/download con Multer");
    logger.info("5. Migrar archivos al nuevo storage");
  } catch (error) {
    logger.error("❌ Error en extracción de archivos binarios:", error);
    process.exit(1);
  } finally {
    if (sqlExtractor) {
      await sqlExtractor.disconnect();
    }
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  extractBinaryFiles();
}

export { extractBinaryFiles };
