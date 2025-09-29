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

    // Ejecutar migración robusta desde los CSV
    logger.info("🚀 Ejecutando migración robusta desde los CSV (final-prisma-migration.js)");
    const { spawn } = await import('child_process');
    await new Promise((resolve, reject) => {
      const child = spawn('node', ['src/migrations/final-prisma-migration.js'], { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`final-prisma-migration.js exited with code ${code}`));
        }
      });
    });
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
