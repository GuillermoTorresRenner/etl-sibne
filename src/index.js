#!/usr/bin/env node

import { ETLPipeline } from "./etl-pipeline.js";
import { logger } from "./utils/logger.js";
import { config } from "./config/database.js";

/**
 * ETL SIBNE - Migración de SQL Server a PostgreSQL
 *
 * Casos de uso:
 * - node src/index.js                              # Migración completa en modo directo
 * - node src/index.js --mode=csv                   # Migración completa vía CSV
 * - node src/index.js --tables=tabla1,tabla2      # Migrar tablas específicas
 * - node src/index.js --sequential                 # Procesar tablas secuencialmente
 * - node src/index.js --help                       # Mostrar ayuda
 */

async function main() {
  const args = process.argv.slice(2);

  // Procesar argumentos
  const options = {
    mode: "csv", // SIEMPRE CSV para generar respaldos
    parallel: true,
    tablesFilter: null,
    excludePatterns: [], // Los filtros por defecto están en el pipeline
  };

  // Parsear argumentos
  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    } else if (arg.startsWith("--mode=")) {
      options.mode = arg.split("=")[1];
    } else if (arg.startsWith("--tables=")) {
      options.tablesFilter = arg
        .split("=")[1]
        .split(",")
        .map((t) => t.trim());
    } else if (arg === "--sequential") {
      options.parallel = false;
    } else if (arg.startsWith("--exclude=")) {
      const excludeList = arg
        .split("=")[1]
        .split(",")
        .map((t) => t.trim());
      options.excludePatterns.push(...excludeList);
    }
  }

  // Validar modo
  if (!["direct", "csv"].includes(options.mode)) {
    logger.error("❌ Modo inválido. Use: direct o csv");
    process.exit(1);
  }

  logger.info("🚀 INICIANDO ETL SIBNE - SOLO TABLAS DEL NEGOCIO");
  logger.info("=================================================");
  logger.info(`📋 Modo: CSV (siempre genera respaldos)`);
  logger.info(`⚡ Paralelización: ${options.parallel ? "Sí" : "No"}`);
  logger.info(
    `🎯 Tablas específicas: ${
      options.tablesFilter
        ? options.tablesFilter.join(", ")
        : "Solo tablas del negocio"
    }`
  );
  logger.info(`🚫 Auto-excluye: AspNet*, __, sys, trace, MSreplication`);
  logger.info(`🔄 Concurrencia: ${config.etl.concurrency}`);
  logger.info(`📦 Tamaño de lote: ${config.etl.batchSize}`);
  logger.info(`💾 CSV generados en: ${config.paths.csvOutput}`);

  const pipeline = new ETLPipeline();

  try {
    const stats = await pipeline.run(options);

    // Código de salida basado en resultados
    if (stats.errors.length === 0) {
      logger.info("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE");
      process.exit(0);
    } else if (stats.success.length > 0) {
      logger.warn("⚠️ MIGRACIÓN COMPLETADA CON ERRORES PARCIALES");
      process.exit(1);
    } else {
      logger.error("💥 MIGRACIÓN FALLÓ COMPLETAMENTE");
      process.exit(2);
    }
  } catch (error) {
    logger.error("💥 ERROR CRÍTICO EN MIGRACIÓN:", error);
    process.exit(3);
  }
}

/**
 * Mostrar ayuda
 */
function showHelp() {
  console.log(`
🎯 ETL SIBNE - Migración de SQL Server a PostgreSQL

USO:
  node src/index.js [opciones]

OPCIONES:
  --mode=MODE          Modo de migración: 'direct' o 'csv' (default: direct)
  --tables=TABLE1,TABLE2  Migrar solo tablas específicas
  --sequential         Procesar tablas secuencialmente (no en paralelo)
  --exclude=PATTERN1,PATTERN2  Patrones adicionales a excluir
  --help, -h          Mostrar esta ayuda

MODOS:
  direct    Migración directa SQL Server → PostgreSQL (más rápido)
  csv       Migración vía CSV intermedio (genera archivos de respaldo)

EJEMPLOS:
  # Migración completa en modo directo
  node src/index.js

  # Migración vía CSV (genera archivos de respaldo)
  node src/index.js --mode=csv

  # Migrar solo tablas específicas
  node src/index.js --tables=usuarios,productos,ventas

  # Migración secuencial (una tabla a la vez)
  node src/index.js --sequential

  # Excluir patrones adicionales
  node src/index.js --exclude=temp,backup

CONFIGURACIÓN:
  Las configuraciones se establecen en el archivo .env:
  - SA_PASSWORD: Password de SQL Server
  - PG_PASSWORD: Password de PostgreSQL
  - BATCH_SIZE: Tamaño de lote para inserción (default: 1000)
  - CONCURRENCY: Tablas a procesar en paralelo (default: 3)

LOGS:
  Los logs se guardan en la carpeta ./logs/
  - etl-combined.log: Todos los logs
  - etl-errors.log: Solo errores
  `);
}

// Manejo de señales
process.on("SIGINT", () => {
  logger.info("🛑 Recibida señal de interrupción, cerrando ETL...");
  process.exit(130);
});

process.on("SIGTERM", () => {
  logger.info("🛑 Recibida señal de terminación, cerrando ETL...");
  process.exit(143);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("💥 Promise rechazada sin manejar:", { reason, promise });
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("💥 Excepción no capturada:", error);
  process.exit(1);
});

// Ejecutar programa principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error("💥 Error fatal:", error);
    process.exit(1);
  });
}
