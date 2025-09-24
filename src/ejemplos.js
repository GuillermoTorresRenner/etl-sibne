#!/usr/bin/env node

/**
 * Script de ejemplo para usar el ETL SIBNE
 *
 * Este script muestra diferentes formas de ejecutar la migración
 */

import { ETLPipeline } from "./etl-pipeline.js";
import { logger } from "./utils/logger.js";

async function ejemploMigracionCompleta() {
  logger.info("🎯 EJEMPLO: Migración completa en modo directo");

  const pipeline = new ETLPipeline();

  const options = {
    mode: "direct", // Migración directa (sin CSV intermedio)
    parallel: true, // Procesar tablas en paralelo
    excludePatterns: [
      // Patrones de tablas a excluir
      "sys",
      "trace",
      "MSreplication",
      "information_schema",
    ],
  };

  try {
    const stats = await pipeline.run(options);
    logger.info("✅ Migración completada:", stats);
  } catch (error) {
    logger.error("❌ Error en migración:", error);
  }
}

async function ejemploMigracionEspecifica() {
  logger.info("🎯 EJEMPLO: Migración de tablas específicas");

  const pipeline = new ETLPipeline();

  const options = {
    mode: "csv", // Modo CSV (genera archivos de respaldo)
    parallel: false, // Procesar secuencialmente
    tablesFilter: [
      // Solo estas tablas
      "usuarios",
      "productos",
      "ventas",
    ],
  };

  try {
    const stats = await pipeline.run(options);
    logger.info("✅ Migración específica completada:", stats);
  } catch (error) {
    logger.error("❌ Error en migración específica:", error);
  }
}

async function ejemploSoloCSV() {
  logger.info("🎯 EJEMPLO: Solo exportar a CSV (sin cargar a PostgreSQL)");

  const { SqlServerExtractor } = await import(
    "./extractors/sqlserver-extractor.js"
  );

  const extractor = new SqlServerExtractor();

  try {
    await extractor.connect();
    const tables = await extractor.getTables();

    logger.info(`📊 Exportando ${tables.length} tablas a CSV...`);

    for (const table of tables.slice(0, 5)) {
      // Solo 5 primeras tablas como ejemplo
      const result = await extractor.extractTableToCSV(
        table.TABLE_NAME,
        table.TABLE_SCHEMA
      );
      logger.info(`✅ Exportado: ${result.outputPath}`);
    }

    await extractor.disconnect();
  } catch (error) {
    logger.error("❌ Error exportando CSV:", error);
  }
}

// Ejecutar ejemplos según argumentos
const ejemplo = process.argv[2];

switch (ejemplo) {
  case "completa":
    ejemploMigracionCompleta();
    break;
  case "especifica":
    ejemploMigracionEspecifica();
    break;
  case "csv":
    ejemploSoloCSV();
    break;
  default:
    console.log(`
🎯 EJEMPLOS DE USO DEL ETL SIBNE

Uso: node src/ejemplos.js [tipo]

Tipos disponibles:
  completa    - Migración completa en modo directo
  especifica  - Migración de tablas específicas en modo CSV
  csv         - Solo exportar primeras 5 tablas a CSV

Ejemplos:
  node src/ejemplos.js completa
  node src/ejemplos.js especifica  
  node src/ejemplos.js csv
    `);
}
