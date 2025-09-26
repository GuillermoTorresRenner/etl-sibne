#!/usr/bin/env node

/**
 * SIBNE ETL - Debug para tabla EmailLogs
 *
 * Análisis específico para resolver discrepancia:
 * SQL Server: 152848 registros
 * PostgreSQL: 152844 registros
 * Diferencia: +4 registros faltantes en PG
 */

import { SqlServerExtractor } from "../extractors/sqlserver-extractor.js";
import { PostgreSQLLoader } from "../loaders/postgres-loader.js";
import { logger } from "../utils/logger.js";

class EmailLogsDebugger {
  constructor() {
    this.tableName = "EmailLogs";
    this.sqlExtractor = new SqlServerExtractor();
    this.pgLoader = new PostgreSQLLoader();
  }

  async initialize() {
    logger.info(`🔧 Inicializando debug para tabla: ${this.tableName}`);
    await this.sqlExtractor.connect();
    await this.pgLoader.connect();
  }

  async analyzeEmailLogsDiscrepancy() {
    try {
      console.log("🔍 ANÁLISIS DE DISCREPANCIA EN TABLA EMAILLOGS");
      console.log("=".repeat(50));

      // 1. Conteo exacto en ambas bases
      const sqlCount = await this.sqlExtractor.pool.request().query(`
        SELECT COUNT(*) as total FROM dbo.EmailLogs
      `);

      const pgCount = await this.pgLoader.executeQuery(`
        SELECT COUNT(*) as total FROM dbo."EmailLogs"
      `);

      console.log(`📊 SQL Server: ${sqlCount.recordset[0].total} registros`);
      console.log(`📊 PostgreSQL: ${pgCount.rows[0].total} registros`);
      console.log(
        `📊 Diferencia: ${
          sqlCount.recordset[0].total - pgCount.rows[0].total
        } registros`
      );

      // 2. Analizar estructura de columnas
      const sqlColumns = await this.sqlExtractor.getTableInfo(
        this.tableName,
        "dbo"
      );

      const pgColumns = await this.pgLoader.executeQuery(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'dbo' AND table_name = 'EmailLogs'
        ORDER BY ordinal_position
      `);

      console.log(`\n📋 Columnas SQL Server: ${sqlColumns.length}`);
      console.log(`📋 Columnas PostgreSQL: ${pgColumns.rows.length}`);

      // 3. Verificar registros con valores NULL o problemáticos
      const nullAnalysis = await this.sqlExtractor.pool.request().query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN Id IS NULL THEN 1 END) as id_null,
          COUNT(CASE WHEN EmpresaId IS NULL THEN 1 END) as empresa_id_null,
          COUNT(CASE WHEN Para IS NULL THEN 1 END) as para_null,
          COUNT(CASE WHEN Msje IS NULL THEN 1 END) as msje_null,
          COUNT(CASE WHEN Estado IS NULL THEN 1 END) as estado_null,
          COUNT(CASE WHEN EmailConfigId IS NULL THEN 1 END) as email_config_id_null,
          COUNT(CASE WHEN FechaHoraRegistro IS NULL THEN 1 END) as fecha_hora_registro_null,
          COUNT(CASE WHEN FechaHoraEnvio IS NULL THEN 1 END) as fecha_hora_envio_null
        FROM dbo.EmailLogs
      `);

      console.log(`\n🔍 Análisis de valores NULL en SQL Server:`);
      console.log(`   Total: ${nullAnalysis.recordset[0].total}`);
      console.log(`   Id NULL: ${nullAnalysis.recordset[0].id_null}`);
      console.log(
        `   EmpresaId NULL: ${nullAnalysis.recordset[0].empresa_id_null}`
      );
      console.log(`   Para NULL: ${nullAnalysis.recordset[0].para_null}`);
      console.log(`   Msje NULL: ${nullAnalysis.recordset[0].msje_null}`);
      console.log(`   Estado NULL: ${nullAnalysis.recordset[0].estado_null}`);

      // 4. Verificar duplicados por ID
      const duplicateCheck = await this.sqlExtractor.pool.request().query(`
        SELECT Id, COUNT(*) as count
        FROM dbo.EmailLogs
        GROUP BY Id
        HAVING COUNT(*) > 1
      `);

      console.log(
        `\n🔍 Registros duplicados por Id: ${duplicateCheck.recordset.length}`
      );

      // 5. Verificar registros con caracteres especiales
      const specialCharsCheck = await this.sqlExtractor.pool.request().query(`
        SELECT COUNT(*) as count
        FROM dbo.EmailLogs
        WHERE Msje LIKE '%[#&°ñáéíóúü]%'
           OR Para LIKE '%[#&°ñáéíóúü]%'
           OR Estado LIKE '%[#&°ñáéíóúü]%'
      `);

      console.log(
        `\n🔍 Registros con caracteres especiales: ${specialCharsCheck.recordset[0].count}`
      );

      // 6. Verificar rango de IDs para encontrar posibles gaps
      const idRangeSQL = await this.sqlExtractor.pool.request().query(`
        SELECT 
          MIN(Id) as min_id, 
          MAX(Id) as max_id, 
          COUNT(DISTINCT Id) as unique_ids
        FROM dbo.EmailLogs
      `);

      const idRangePG = await this.pgLoader.executeQuery(`
        SELECT 
          MIN(id) as min_id, 
          MAX(id) as max_id, 
          COUNT(DISTINCT id) as unique_ids
        FROM dbo."EmailLogs"
      `);

      console.log(`\n🔍 Rango de IDs:`);
      console.log(
        `   SQL Server - Min: ${idRangeSQL.recordset[0].min_id}, Max: ${idRangeSQL.recordset[0].max_id}, Únicos: ${idRangeSQL.recordset[0].unique_ids}`
      );
      console.log(
        `   PostgreSQL - Min: ${idRangePG.rows[0].min_id}, Max: ${idRangePG.rows[0].max_id}, Únicos: ${idRangePG.rows[0].unique_ids}`
      );

      // 7. Buscar los IDs que están en SQL Server pero no en PostgreSQL
      console.log(`\n🔍 Buscando registros faltantes...`);

      // Obtener algunos IDs de muestra de SQL Server
      const sampleSQLIds = await this.sqlExtractor.pool.request().query(`
        SELECT TOP 10 Id FROM dbo.EmailLogs ORDER BY Id DESC
      `);

      console.log(`🔍 Últimos 10 IDs en SQL Server:`);
      sampleSQLIds.recordset.forEach((row) => {
        console.log(`   ID: ${row.Id}`);
      });

      // Verificar si estos IDs existen en PostgreSQL
      for (const row of sampleSQLIds.recordset.slice(0, 5)) {
        const pgCheck = await this.pgLoader.executeQuery(`
          SELECT COUNT(*) as count FROM dbo."EmailLogs" WHERE id = ${row.Id}
        `);

        const exists = pgCheck.rows[0].count > 0;
        console.log(
          `   ID ${row.Id}: ${
            exists ? "✅ Existe" : "❌ Faltante"
          } en PostgreSQL`
        );
      }

      // 8. Verificar problemas específicos mencionados en la migración
      console.log(
        `\n🔍 Verificando filas problemáticas mencionadas en logs...`
      );

      // Los logs de migración mencionaron problemas en ciertas filas
      const problematicRows = [
        2062, 2063, 4755, 4756, 7395, 7396, 10164, 10165,
      ];

      console.log(`⚠️ Filas problemáticas detectadas durante la migración:`);
      problematicRows.forEach((rowNum) => {
        console.log(`   - Fila ${rowNum}: Número incorrecto de columnas`);
      });

      console.log("\n" + "=".repeat(50));
      console.log("📋 RESUMEN DEL ANÁLISIS");
      console.log("=".repeat(50));
      console.log(
        `📊 Registros diferencia: ${
          sqlCount.recordset[0].total - pgCount.rows[0].total
        }`
      );
      console.log(
        `🔍 Duplicados encontrados: ${duplicateCheck.recordset.length}`
      );
      console.log(
        `⚠️ Caracteres especiales: ${specialCharsCheck.recordset[0].count}`
      );
      console.log(`📋 Filas problemáticas en CSV: ${problematicRows.length}`);

      console.log(`\n💡 POSIBLES CAUSAS:`);
      console.log(
        `   1. Filas con formato CSV incorrecto (${problematicRows.length} detectadas)`
      );
      console.log(
        `   2. Campos con saltos de línea no escapados correctamente`
      );
      console.log(`   3. Registros con caracteres especiales malformados`);
      console.log(
        `   4. Problemas en el parser CSV con campos de texto largos`
      );

      console.log(`\n🔧 SIGUIENTE PASO:`);
      console.log(`   Revisar las filas específicas problemáticas en el CSV`);
      console.log(
        `   y ajustar el parser para manejar mejor campos de texto largos`
      );
    } catch (error) {
      console.error("❌ Error en análisis:", error);
    }
  }

  async cleanup() {
    logger.info("🧹 Limpiando conexiones de debug");
    if (this.sqlExtractor.isConnected) {
      await this.sqlExtractor.disconnect();
      logger.info("🔌 Desconectado de SQL Server");
    }
    if (this.pgLoader.isConnected) {
      await this.pgLoader.disconnect();
      logger.info("🔌 Desconectado de PostgreSQL");
    }
  }
}

// Función principal
async function debugEmailLogs() {
  const emailLogsDebugger = new EmailLogsDebugger();
  try {
    await emailLogsDebugger.initialize();
    await emailLogsDebugger.analyzeEmailLogsDiscrepancy();
  } catch (error) {
    console.error("💥 Error en debug de EmailLogs:", error);
  } finally {
    await emailLogsDebugger.cleanup();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugEmailLogs();
}

export { EmailLogsDebugger, debugEmailLogs };
