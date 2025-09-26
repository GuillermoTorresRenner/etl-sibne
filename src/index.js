#!/usr/bin/env node

/**
 * SIBNE ETL - Punto de entrada principal
 * Sistema de migración completa optimizado con concurrencia y FK constraints
 */

import runFullMigration from "./scripts/migrate-full.js";
import { logger } from "./utils/logger.js";

async function main() {
  try {
    logger.info("🚀 INICIANDO MIGRACIÓN OPTIMIZADA SIBNE ETL");
    logger.info("===============================================");

    // Ejecutar migración completa optimizada
    await runFullMigration();
  } catch (error) {
    logger.error("❌ Error en migración optimizada:", error);
    console.error("❌ Error en migración:", error.message);
    process.exit(1);
  }
}

// Verificar si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
