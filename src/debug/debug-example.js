#!/usr/bin/env node

/**
 * SIBNE ETL - Debug de Ejemplo usando Template Actualizado
 *
 * Este archivo demuestra cómo usar el template actualizado
 * para debuggear cualquier tabla de manera efectiva
 */

import { TableDebugger, debugSpecificTable } from "./debug-template.js";
import { logger } from "../utils/logger.js";

/**
 * Ejemplo de uso extendido del template
 */
class ExampleTableDebugger extends TableDebugger {
  constructor(tableName) {
    super(tableName);
  }

  async extendedAnalysis() {
    try {
      // Usar el análisis base del template
      const baseResults = await this.debugTable();

      // Agregar análisis específico
      console.log("\n🔍 ANÁLISIS EXTENDIDO");
      console.log("=".repeat(30));

      if (baseResults.difference !== 0) {
        // Análisis de valores NULL
        const nullAnalysis = await this.sqlExtractor.pool.request().query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN Id IS NULL THEN 1 END) as id_null
          FROM dbo.${this.tableName}
        `);

        console.log(
          `🔍 Registros con Id NULL: ${nullAnalysis.recordset[0].id_null}`
        );

        // Buscar duplicados
        const duplicates = await this.sqlExtractor.pool.request().query(`
          SELECT Id, COUNT(*) as count
          FROM dbo.${this.tableName}
          GROUP BY Id
          HAVING COUNT(*) > 1
        `);

        console.log(
          `🔍 Duplicados encontrados: ${duplicates.recordset.length}`
        );
      }

      return baseResults;
    } catch (error) {
      logger.error(`❌ Error en análisis extendido:`, error);
      throw error;
    }
  }
}

// Función para debuggear tabla específica con análisis extendido
async function debugTableExtended(tableName) {
  const extendedDebugger = new ExampleTableDebugger(tableName);

  try {
    await extendedDebugger.initialize();
    const results = await extendedDebugger.extendedAnalysis();

    console.log("\n📋 CONCLUSIONES:");
    if (results.difference === 0) {
      console.log("✅ No hay discrepancias en el conteo de registros");
    } else {
      console.log(
        `⚠️ Se detectaron ${Math.abs(
          results.difference
        )} registros de diferencia`
      );
      console.log("💡 Revisar logs de migración para identificar causa");
    }
  } catch (error) {
    logger.error("❌ Error en debug extendido:", error);
  } finally {
    await extendedDebugger.cleanup();
  }
}

// Mostrar ejemplos de uso
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
🔧 EJEMPLO DE USO DEL TEMPLATE DEBUG
===================================

Este archivo muestra cómo extender el template base para análisis específicos.

Ejemplos de uso:

1. Debug básico de cualquier tabla:
   const results = await debugSpecificTable("NombreTabla");

2. Debug extendido con análisis adicional:
   await debugTableExtended("NombreTabla");

3. Crear tu propia clase extendida:
   class MiDebugger extends TableDebugger {
     async miAnalisisEspecifico() {
       // Tu lógica aquí
     }
   }

📝 RECUERDA:
- Usar this.sqlExtractor.pool.request().query() para SQL Server
- Usar this.pgLoader.executeQuery() para PostgreSQL  
- Nombres de tabla en PG con comillas: "NombreTabla"
- Evitar palabra reservada "debugger" como nombre de variable
  `);
}

export { ExampleTableDebugger, debugTableExtended };
