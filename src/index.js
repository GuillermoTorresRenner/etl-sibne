#!/usr/bin/env node

import { ETLPipeline } from "./etl-pipeline.js";
import { logger } from "./utils/logger.js";
import { config } from "./config/database.js";
import MigrationReportGenerator from "../generate-migration-report.js";
import { spawn } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ejecuta un script de Node.js de forma asíncrona
 */
async function executeNodeScript(scriptPath, description) {
  return new Promise((resolve, reject) => {
    logger.info(`🚀 ${description}...`);

    const projectRoot = path.join(__dirname, "..");
    const fullScriptPath = path.join(projectRoot, scriptPath);

    const child = spawn("node", [fullScriptPath], {
      cwd: projectRoot,
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        logger.info(`✅ ${description} completado exitosamente`);
        resolve(code);
      } else {
        logger.error(`❌ ${description} falló con código: ${code}`);
        reject(new Error(`${description} falló`));
      }
    });

    child.on("error", (error) => {
      logger.error(`❌ Error ejecutando ${description}:`, error);
      reject(error);
    });
  });
}

/**
 * Ejecuta la migración integral: ETL + Binarios + Metadatos + Reporte
 */
async function runIntegralMigration(options) {
  try {
    logger.info("🚀 INICIANDO MIGRACIÓN INTEGRAL SIBNE");
    logger.info("=====================================");

    // PASO 1: Ejecutar ETL principal
    logger.info("📊 PASO 1: Migración de datos estructurados");
    const pipeline = new ETLPipeline();
    const stats = await pipeline.run(options);

    // PASO 2: Extraer archivos binarios
    logger.info("📁 PASO 2: Extracción de archivos binarios");
    await executeNodeScript(
      "extract-binaries.js",
      "Extracción de archivos binarios"
    );

    // PASO 3: Migrar metadatos de archivos
    logger.info("🗃️ PASO 3: Migración de metadatos de archivos");
    await executeNodeScript(
      "migrate-archivo-adjunto.js",
      "Migración de metadatos"
    );

    // PASO 4: Generar reporte final
    logger.info("📋 PASO 4: Generación de reporte integral");
    await generateMigrationReport();

    // Resultado final
    if (stats.errors.length === 0) {
      logger.info("🎉 MIGRACIÓN INTEGRAL COMPLETADA EXITOSAMENTE");
      logger.info(
        "✅ Datos migrados, archivos extraídos, metadatos sincronizados y reporte generado"
      );
      return 0;
    } else if (stats.success.length > 0) {
      logger.warn("⚠️ MIGRACIÓN INTEGRAL COMPLETADA CON ERRORES PARCIALES");
      logger.info(
        "✅ Archivos extraídos, metadatos sincronizados y reporte generado"
      );
      return 1;
    } else {
      logger.error("💥 MIGRACIÓN INTEGRAL FALLÓ");
      return 2;
    }
  } catch (error) {
    logger.error("💥 ERROR CRÍTICO EN MIGRACIÓN INTEGRAL:", error);
    throw error;
  }
}

/**
 * Genera el reporte de migración automáticamente
 */
async function generateMigrationReport() {
  try {
    const generator = new MigrationReportGenerator();
    const reportPath = await generator.generateReport();
    logger.info(`✅ Reporte generado exitosamente: ${reportPath}`);
  } catch (error) {
    logger.error("❌ Error generando reporte de migración:", error);
    // No fallar la migración por error en reporte
  }
}

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
    integral: false, // Nueva opción para migración integral
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
    } else if (arg === "--integral") {
      options.integral = true;
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

  // Decidir tipo de migración
  if (options.integral) {
    // MIGRACIÓN INTEGRAL: ETL + Binarios + Metadatos + Reporte
    try {
      const exitCode = await runIntegralMigration(options);
      process.exit(exitCode);
    } catch (error) {
      logger.error("💥 ERROR CRÍTICO EN MIGRACIÓN INTEGRAL:", error);
      process.exit(3);
    }
  } else {
    // MIGRACIÓN TRADICIONAL: Solo ETL
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

        // 📋 Generar reporte automáticamente al finalizar
        logger.info("📋 Generando reporte de migración...");
        await generateMigrationReport();

        process.exit(0);
      } else if (stats.success.length > 0) {
        logger.warn("⚠️ MIGRACIÓN COMPLETADA CON ERRORES PARCIALES");

        // 📋 Generar reporte incluso con errores parciales
        logger.info("📋 Generando reporte de migración...");
        await generateMigrationReport();

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
  --mode=MODE          Modo de migración: 'direct' o 'csv' (default: csv)
  --tables=TABLE1,TABLE2  Migrar solo tablas específicas
  --sequential         Procesar tablas secuencialmente (no en paralelo)
  --integral           🚀 MIGRACIÓN COMPLETA: ETL + Binarios + Metadatos + Reporte
  --exclude=PATTERN1,PATTERN2  Patrones adicionales a excluir
  --help, -h          Mostrar esta ayuda

MODOS:
  csv       Migración vía CSV intermedio (genera archivos de respaldo)
  direct    Migración directa SQL Server → PostgreSQL (más rápido)

EJEMPLOS:
  # 🚀 MIGRACIÓN INTEGRAL COMPLETA (RECOMENDADO)
  node src/index.js --integral

  # Migración tradicional (solo ETL)
  node src/index.js

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
