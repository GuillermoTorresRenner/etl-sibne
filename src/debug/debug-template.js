#!/usr/bin/env node

/**
 * SIBNE ETL - Template de Debug para Tabla Individual
 *
 * Plantilla para debugging de una tabla específica
 * Permite probar correcciones sin afectar el flujo principal
 */

import { SqlServerExtractor } from "../extractors/sqlserver-extractor.js";
import { PostgreSQLLoader } from "../loaders/postgres-loader.js";
import { config } from "../config/database.js";
import { logger } from "../utils/logger.js";

/**
 * Clase para debugging de tabla individual
 */
class TableDebugger {
  constructor(tableName) {
    this.tableName = tableName;
    this.sqlExtractor = new SqlServerExtractor();
    this.pgLoader = new PostgreSQLLoader();
  }

  async initialize() {
    logger.info(`🔧 Inicializando debug para tabla: ${this.tableName}`);
    await this.sqlExtractor.connect();
    await this.pgLoader.connect();
  }

  async debugTable() {
    try {
      logger.info(`🔍 Analizando tabla: ${this.tableName}`);

      // 1. Obtener info de la tabla desde SQL Server
      const columns = await this.sqlExtractor.getTableInfo(
        this.tableName,
        "dbo"
      );
      logger.info(`📋 Columnas detectadas: ${columns.length}`);

      // 2. Conteo de registros en ambas bases
      const sqlCount = await this.sqlExtractor.pool.request().query(`
        SELECT COUNT(*) as total FROM dbo.${this.tableName}
      `);

      const pgCount = await this.pgLoader.executeQuery(`
        SELECT COUNT(*) as total FROM dbo."${this.tableName}"
      `);

      logger.info(`📊 SQL Server: ${sqlCount.recordset[0].total} registros`);
      logger.info(`📊 PostgreSQL: ${pgCount.rows[0].total} registros`);

      // 3. Extraer algunos registros de muestra
      const sampleData = await this.sqlExtractor.pool.request().query(`
        SELECT TOP 5 * FROM dbo.${this.tableName}
      `);
      logger.info(`📊 Registros de muestra: ${sampleData.recordset.length}`);

      // 4. Verificar estructura en PostgreSQL (usar minúsculas para nombres de columna)
      const pgStructure = await this.pgLoader.executeQuery(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'dbo' 
        AND table_name = '${this.tableName}'
        ORDER BY ordinal_position;
      `);
      logger.info(`🗃️ Columnas en PostgreSQL: ${pgStructure.rows.length}`);

      return {
        sqlColumns: columns,
        sqlCount: sqlCount.recordset[0].total,
        pgCount: pgCount.rows[0].total,
        difference: sqlCount.recordset[0].total - pgCount.rows[0].total,
        sampleData: sampleData.recordset,
        pgStructure: pgStructure.rows,
      };
    } catch (error) {
      logger.error(`❌ Error en debug de ${this.tableName}:`, error);
      throw error;
    }
  }

  async cleanup() {
    logger.info("🧹 Limpiando conexiones de debug");
    if (this.sqlExtractor) await this.sqlExtractor.disconnect();
    if (this.pgLoader) await this.pgLoader.disconnect();
  }
}

/**
 * Función principal de debug
 */
async function debugSpecificTable(tableName) {
  const tableDebugger = new TableDebugger(tableName);

  try {
    await tableDebugger.initialize();
    const results = await tableDebugger.debugTable();

    console.log("\n=== RESULTADOS DEL DEBUG ===");
    console.log(`📋 SQL Server columnas: ${results.sqlColumns.length}`);
    console.log(`📊 SQL Server registros: ${results.sqlCount}`);
    console.log(`📊 PostgreSQL registros: ${results.pgCount}`);
    console.log(`📊 Diferencia registros: ${results.difference}`);
    console.log(`📊 Registros muestra: ${results.sampleData.length}`);
    console.log(`🗃️ PostgreSQL columnas: ${results.pgStructure.length}`);

    // Mostrar diferencias si las hay
    if (results.sqlColumns.length !== results.pgStructure.length) {
      console.log("⚠️  DIFERENCIA EN NÚMERO DE COLUMNAS DETECTADA");
    }

    if (results.difference > 0) {
      console.log(`⚠️  FALTAN ${results.difference} REGISTROS EN POSTGRESQL`);
    } else if (results.difference < 0) {
      console.log(
        `⚠️  HAY ${Math.abs(results.difference)} REGISTROS EXTRA EN POSTGRESQL`
      );
    } else {
      console.log("✅ NÚMERO DE REGISTROS COINCIDE");
    }

    return results;
  } catch (error) {
    logger.error("❌ Error en debug:", error);
    throw error;
  } finally {
    await tableDebugger.cleanup();
  }
}

// Exportar para uso en otros archivos de debug
export { TableDebugger, debugSpecificTable };

// Si se ejecuta directamente, mostrar ayuda
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
🔧 TEMPLATE DE DEBUG - SIBNE ETL
================================

Para usar esta plantilla:

1. Copia este archivo: debug-[TABLA].js
2. Modifica la tabla objetivo
3. Agrega tu lógica de debug específica
4. Ejecuta: node src/debug/debug-[TABLA].js

Ejemplo:
  node src/debug/debug-ArchivoAdjunto.js

📝 NOTAS IMPORTANTES:

✅ Usar para SQL Server:
   await this.sqlExtractor.pool.request().query(\`SELECT...\`)

✅ Usar para PostgreSQL (nombres en minúsculas con comillas):
   await this.pgLoader.executeQuery(\`SELECT * FROM dbo."NombreTabla"\`)

✅ Evitar palabra reservada:
   const tableDebugger = new TableDebugger(); // NO: debugger

✅ Siempre usar comillas dobles para nombres de tabla/columna en PG:
   SELECT "id", "nombre" FROM dbo."Contacto"

⚠️ Recordar que las columnas en PG están en minúsculas/camelCase
  `);
}
