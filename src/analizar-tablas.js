#!/usr/bin/env node

/**
 * Script para ver qué tablas del negocio están disponibles
 */

import { SqlServerExtractor } from "./extractors/sqlserver-extractor.js";
import { logger } from "./utils/logger.js";

async function mostrarTablasDelNegocio() {
  logger.info("🔍 ANALIZANDO TABLAS DEL NEGOCIO");
  logger.info("================================");

  const extractor = new SqlServerExtractor();

  try {
    await extractor.connect();
    const todasLasTablas = await extractor.getTables();

    // Patrones para excluir tablas del sistema
    const systemPatterns = [
      "sys",
      "trace",
      "MSreplication",
      "information_schema",
      "AspNet", // Todas las tablas de ASP.NET Identity
      "__", // Tablas que empiecen con __
    ];

    // Separar tablas del sistema y del negocio
    const tablasDelSistema = [];
    const tablasDelNegocio = [];

    todasLasTablas.forEach((table) => {
      const fullName = `${table.TABLE_SCHEMA}.${table.TABLE_NAME}`;
      const tableName = table.TABLE_NAME;

      const esDelSistema = systemPatterns.some((pattern) => {
        return (
          fullName.toLowerCase().includes(pattern.toLowerCase()) ||
          tableName.toLowerCase().includes(pattern.toLowerCase()) ||
          tableName.startsWith("AspNet") ||
          tableName.startsWith("__")
        );
      });

      if (esDelSistema) {
        tablasDelSistema.push(table);
      } else {
        tablasDelNegocio.push(table);
      }
    });

    logger.info(`📊 RESUMEN:`);
    logger.info(`   • Total de tablas: ${todasLasTablas.length}`);
    logger.info(`   • Tablas del sistema: ${tablasDelSistema.length}`);
    logger.info(`   • Tablas del negocio: ${tablasDelNegocio.length}`);

    logger.info("\\n🚫 TABLAS DEL SISTEMA (serán excluidas):");
    tablasDelSistema.forEach((table, index) => {
      logger.info(`   ${index + 1}. ${table.TABLE_SCHEMA}.${table.TABLE_NAME}`);
    });

    logger.info("\\n✅ TABLAS DEL NEGOCIO (serán migradas):");
    if (tablasDelNegocio.length === 0) {
      logger.warn("   ⚠️ No se encontraron tablas del negocio");
    } else {
      for (let i = 0; i < tablasDelNegocio.length; i++) {
        const table = tablasDelNegocio[i];
        try {
          const count = await extractor.getTableCount(
            table.TABLE_NAME,
            table.TABLE_SCHEMA
          );
          logger.info(
            `   ${i + 1}. ${table.TABLE_SCHEMA}.${
              table.TABLE_NAME
            } (${count.toLocaleString()} filas)`
          );
        } catch (error) {
          logger.info(
            `   ${i + 1}. ${table.TABLE_SCHEMA}.${
              table.TABLE_NAME
            } (error contando filas)`
          );
        }
      }

      // Calcular total de filas del negocio
      let totalFilas = 0;
      for (const table of tablasDelNegocio) {
        try {
          const count = await extractor.getTableCount(
            table.TABLE_NAME,
            table.TABLE_SCHEMA
          );
          totalFilas += count;
        } catch (error) {
          // Continuar con la siguiente tabla
        }
      }

      logger.info(
        `\\n📈 TOTAL DE DATOS DEL NEGOCIO: ${totalFilas.toLocaleString()} filas`
      );
    }

    await extractor.disconnect();
  } catch (error) {
    logger.error("❌ Error analizando tablas:", error);
    process.exit(1);
  }
}

// Ejecutar análisis
mostrarTablasDelNegocio();
