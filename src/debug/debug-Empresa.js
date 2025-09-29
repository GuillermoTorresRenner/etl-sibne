#!/usr/bin/env node

/**
 * SIBNE ETL - Debug para tabla Empres      // 3. Verificar registros con valores NULL o problemáticos
      const nullAnalysis = await this.sqlExtractor.pool.request().query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN Id IS NULL THEN 1 END) as id_null,
          COUNT(CASE WHEN RazonSocial IS NULL THEN 1 END) as razon_social_null,
          COUNT(CASE WHEN Direccion IS NULL THEN 1 END) as direccion_null,
          COUNT(CASE WHEN Rut IS NULL THEN 1 END) as rut_null,
          COUNT(CASE WHEN Nombre IS NULL THEN 1 END) as nombre_null
        FROM dbo.Empresa
      `);

      console.log(`\n🔍 Análisis de valores NULL en SQL Server:`);
      const nullStats = nullAnalysis.recordset[0];
      console.log(`   Total: ${nullStats.total}`);
      console.log(`   Id NULL: ${nullStats.id_null}`);
      console.log(`   RazonSocial NULL: ${nullStats.razon_social_null}`);
      console.log(`   Direccion NULL: ${nullStats.direccion_null}`);
      console.log(`   Rut NULL: ${nullStats.rut_null}`);
      console.log(`   Nombre NULL: ${nullStats.nombre_null}`);specífico para la tabla Empresa
 * que debe migrarse ANTES que Contacto (FK empresaId)
 */

import { SqlServerExtractor } from "../extractors/sqlserver-extractor.js";
import { PostgreSQLLoader } from "../loaders/postgres-loader.js";
import { logger } from "../utils/logger.js";

class EmpresaDebugger {
  constructor() {
    this.tableName = "Empresa";
    this.sqlExtractor = new SqlServerExtractor();
    this.pgLoader = new PostgreSQLLoader();
  }

  async initialize() {
    logger.info(`� Inicializando debug para tabla: ${this.tableName}`);
    await this.sqlExtractor.connect();
    await this.pgLoader.connect();
  }

  async analyzeEmpresaDiscrepancy() {
    try {
      console.log("🔍 ANÁLISIS DE TABLA EMPRESA");
      console.log("=".repeat(50));

      // 1. Conteo exacto en ambas bases
      const sqlCount = await this.sqlExtractor.pool.request().query(`
        SELECT COUNT(*) as total FROM dbo.Empresa
      `);

      const pgCount = await this.pgLoader.executeQuery(`
        SELECT COUNT(*) as total FROM dbo."Empresa"
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
        WHERE table_schema = 'dbo' AND table_name = 'Empresa'
        ORDER BY ordinal_position
      `);

      console.log(`\n📋 Columnas SQL Server: ${sqlColumns.length}`);
      console.log(`📋 Columnas PostgreSQL: ${pgColumns.rows.length}`);

      // 3. Verificar registros con valores NULL o problemáticos
      const nullAnalysis = await this.sqlExtractor.pool.request().query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN Id IS NULL THEN 1 END) as id_null,
          COUNT(CASE WHEN RazonSocial IS NULL THEN 1 END) as razon_social_null,
          COUNT(CASE WHEN Direccion IS NULL THEN 1 END) as direccion_null,
          COUNT(CASE WHEN Rut IS NULL THEN 1 END) as rut_null,
          COUNT(CASE WHEN Nombre IS NULL THEN 1 END) as nombre_null
        FROM dbo.Empresa
      `);

      console.log(`\n� Análisis de valores NULL en SQL Server:`);
      const nullStats = nullAnalysis.recordset[0];
      console.log(`   Total: ${nullStats.total}`);
      console.log(`   Id NULL: ${nullStats.id_null}`);
      console.log(`   RazonSocial NULL: ${nullStats.razon_social_null}`);
      console.log(`   Direccion NULL: ${nullStats.direccion_null}`);
      console.log(`   Rut NULL: ${nullStats.rut_null}`);
      console.log(`   Nombre NULL: ${nullStats.nombre_null}`);
      // 4. Buscar registros duplicados por Id
      const duplicates = await this.sqlExtractor.pool.request().query(`
        SELECT Id, COUNT(*) as count
        FROM dbo.Empresa
        GROUP BY Id
        HAVING COUNT(*) > 1
        ORDER BY count DESC
      `);

      console.log(
        `\n🔍 Registros duplicados por Id: ${duplicates.recordset.length}`
      );
      if (duplicates.recordset.length > 0) {
        console.log("   Primeros 5 duplicados:");
        duplicates.recordset.slice(0, 5).forEach((dup) => {
          console.log(`   Id ${dup.Id}: ${dup.count} veces`);
        });
      }

      // 5. Verificar registros con caracteres especiales o problemáticos
      const specialChars = await this.sqlExtractor.pool.request().query(`
        SELECT COUNT(*) as count
        FROM dbo.Empresa
        WHERE RazonSocial LIKE '%[^a-zA-Z0-9 áéíóúñÁÉÍÓÚÑ.,@-]%'
           OR Direccion LIKE '%[^a-zA-Z0-9 áéíóúñÁÉÍÓÚÑ.,@-]%'
      `);

      console.log(
        `\n� Registros con caracteres especiales: ${specialChars.recordset[0].count}`
      );
      // 6. Verificar rango de IDs
      const idRange = await this.sqlExtractor.pool.request().query(`
        SELECT 
          MIN(Id) as min_id,
          MAX(Id) as max_id,
          COUNT(DISTINCT Id) as unique_ids
        FROM dbo.Empresa
      `);

      const pgIdRange = await this.pgLoader.executeQuery(`
        SELECT 
          MIN("id") as min_id,
          MAX("id") as max_id,
          COUNT(DISTINCT "id") as unique_ids
        FROM dbo."Empresa"
      `);

      console.log(`\n� Rango de IDs:`);
      console.log(
        `   SQL Server - Min: ${idRange.recordset[0].min_id}, Max: ${idRange.recordset[0].max_id}, Únicos: ${idRange.recordset[0].unique_ids}`
      );
      console.log(
        `   PostgreSQL - Min: ${pgIdRange.rows[0].min_id}, Max: ${pgIdRange.rows[0].max_id}, Únicos: ${pgIdRange.rows[0].unique_ids}`
      );

      // 7. Buscar últimos registros para análisis
      console.log(
        "   ⚠️ Comparando últimos registros (LinkedServer no disponible)"
      );

      const lastRecordsSQL = await this.sqlExtractor.pool.request().query(`
        SELECT TOP 10 Id, RazonSocial, Direccion 
        FROM dbo.Empresa 
        ORDER BY Id DESC
      `);

      console.log(`\n🔍 Últimos 10 registros en SQL Server:`);
      lastRecordsSQL.recordset.forEach((record) => {
        console.log(
          `   Id: ${record.Id}, RazonSocial: ${record.RazonSocial?.substring(0, 30)}...`
        );
      });

      return {
        sqlCount: sqlCount.recordset[0].total,
        pgCount: pgCount.rows[0].total,
        difference: sqlCount.recordset[0].total - pgCount.rows[0].total,
        duplicates: duplicates.recordset.length,
        specialChars: specialChars.recordset[0].count,
      };
    } catch (error) {
      logger.error(`❌ Error en análisis de Empresa:`, error);
      throw error;
    }
  }

  async cleanup() {
    logger.info("🧹 Limpiando conexiones de debug");
    if (this.sqlExtractor) await this.sqlExtractor.disconnect();
    if (this.pgLoader) await this.pgLoader.disconnect();
  }
}

// Función principal
async function debugEmpresa() {
  const empresaDebugger = new EmpresaDebugger();

  try {
    await empresaDebugger.initialize();
    const results = await empresaDebugger.analyzeEmpresaDiscrepancy();

    console.log("\n" + "=".repeat(50));
    console.log("📋 RESUMEN DEL ANÁLISIS");
    console.log("=".repeat(50));
    console.log(`📊 Registros diferencia: ${results.difference}`);
    console.log(`🔍 Duplicados encontrados: ${results.duplicates}`);
    console.log(`⚠️ Caracteres especiales: ${results.specialChars}`);

    if (results.difference !== 0) {
      console.log("\n💡 POSIBLES CAUSAS:");
      console.log("   1. Registros con caracteres especiales no migrados");
      console.log("   2. Duplicados que causan violación de constrains");
      console.log("   3. Registros con valores NULL en campos requeridos");
      console.log("   4. Problemas en el mapeo de columnas");
      console.log("\n🔧 SIGUIENTE PASO:");
      console.log("   Revisar logs de migración para errores específicos");
    } else {
      console.log("\n✅ MIGRACIÓN DE EMPRESA: COMPLETA");
      console.log("   Ahora se puede proceder con la migración de Contacto");
    }
  } catch (error) {
    logger.error("❌ Error en debug:", error);
    process.exit(1);
  } finally {
    await empresaDebugger.cleanup();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugEmpresa();
}

export { EmpresaDebugger, debugEmpresa };