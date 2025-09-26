#!/usr/bin/env node

/**
 * SIBNE ETL - Punto de entrada principal
 * Sistema de migración completa usando ETLPipeline optimizado
 */

import { ETLPipeline } from "./scripts/main.js";
import { logger } from "./utils/logger.js";

async function main() {
  const pipeline = new ETLPipeline();

  try {
    logger.info("🚀 INICIANDO MIGRACIÓN COMPLETA SIBNE ETL");
    logger.info("==========================================");

    // Inicializar pipeline
    await pipeline.initialize();

    // Configurar opciones de migración
    const options = {
      mode: "csv", // Siempre generar CSV como respaldo
      parallel: true, // Procesamiento paralelo para mejor rendimiento
      excludePatterns: [
        // Patrones adicionales de exclusión si los necesitas
      ],
    };

    // Ejecutar migración completa
    await pipeline.run(options);

    logger.info("🎉 ¡MIGRACIÓN COMPLETA EXITOSA!");
  } catch (error) {
    logger.error("❌ Error en migración:", error);
    process.exit(1);
  } finally {
    // Cleanup
    await pipeline.cleanup();
  }
}

// Verificar si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
