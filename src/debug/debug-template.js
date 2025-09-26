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
      const columns = await this.sqlExtractor.getTableInfo(this.tableName, "dbo");
      logger.info(`📋 Columnas detectadas: ${columns.length}`);
      
      // 2. Extraer algunos registros de muestra
      const sampleData = await this.sqlExtractor.query(`
        SELECT TOP 5 * FROM dbo.${this.tableName}
      `);
      logger.info(`📊 Registros de muestra: ${sampleData.recordset.length}`);
      
      // 3. Verificar estructura en PostgreSQL
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
        sampleData: sampleData.recordset,
        pgStructure: pgStructure.rows
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
    console.log(`📊 Registros muestra: ${results.sampleData.length}`);
    console.log(`🗃️ PostgreSQL columnas: ${results.pgStructure.length}`);
    
    // Mostrar diferencias si las hay
    if (results.sqlColumns.length !== results.pgStructure.length) {
      console.log("⚠️  DIFERENCIA EN NÚMERO DE COLUMNAS DETECTADA");
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
  `);
}