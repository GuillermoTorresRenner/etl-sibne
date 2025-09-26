#!/usr/bin/env node

/**
 * Analizador de registros con caracteres especiales en Empresa
 */

import { SqlServerExtractor } from "../extractors/sqlserver-extractor.js";
import { logger } from "../utils/logger.js";

async function analyzeSpecialChars() {
  const extractor = new SqlServerExtractor();
  
  try {
    await extractor.connect();
    
    console.log('🔍 ANÁLISIS DE CARACTERES ESPECIALES EN EMPRESA');
    console.log('='.repeat(60));
    
    // 1. Contar total
    const total = await extractor.pool.request().query('SELECT COUNT(*) as count FROM dbo.Empresa');
    console.log(`📊 Total en SQL Server: ${total.recordset[0].count}`);
    
    // 2. Contar con caracteres especiales básicos
    const specialChars1 = await extractor.pool.request().query(`
      SELECT COUNT(*) as count
      FROM dbo.Empresa
      WHERE RazonSocial COLLATE SQL_Latin1_General_CP1_CI_AS LIKE '%[^a-zA-Z0-9 áéíóúñÁÉÍÓÚÑ.,@()-]%'
         OR Direccion COLLATE SQL_Latin1_General_CP1_CI_AS LIKE '%[^a-zA-Z0-9 áéíóúñÁÉÍÓÚÑ.,@()-]%'
    `);
    console.log(`⚠️ Con caracteres especiales (restrictivo): ${specialChars1.recordset[0].count}`);
    
    // 3. Contar con caracteres más amplios
    const specialChars2 = await extractor.pool.request().query(`
      SELECT COUNT(*) as count
      FROM dbo.Empresa
      WHERE RazonSocial LIKE '%[&%#$]%'
         OR Direccion LIKE '%[&%#$]%'
         OR RazonSocial LIKE '%""%'
         OR Direccion LIKE '%""%'
    `);
    console.log(`⚠️ Con caracteres problemáticos (&, %, #, $, ""): ${specialChars2.recordset[0].count}`);
    
    // 4. Ejemplos de registros con caracteres especiales
    const examples1 = await extractor.pool.request().query(`
      SELECT TOP 10 Id, RazonSocial, Direccion
      FROM dbo.Empresa
      WHERE RazonSocial COLLATE SQL_Latin1_General_CP1_CI_AS LIKE '%[^a-zA-Z0-9 áéíóúñÁÉÍÓÚÑ.,@()-]%'
         OR Direccion COLLATE SQL_Latin1_General_CP1_CI_AS LIKE '%[^a-zA-Z0-9 áéíóúñÁÉÍÓÚÑ.,@()-]%'
      ORDER BY Id
    `);
    
    console.log('\n📋 Ejemplos de registros con caracteres especiales:');
    examples1.recordset.forEach(row => {
      console.log(`   ID ${row.Id}: "${row.RazonSocial?.substring(0, 60)}"`);
      if (row.Direccion && row.Direccion.trim()) {
        console.log(`              Dir: "${row.Direccion?.substring(0, 60)}"`);
      }
    });
    
    // 5. Buscar registros con IDs altos que podrían no estar en PostgreSQL
    const highIds = await extractor.pool.request().query(`
      SELECT TOP 20 Id, RazonSocial
      FROM dbo.Empresa
      WHERE Id > 13100
      ORDER BY Id DESC
    `);
    
    console.log('\n📋 Últimos 20 registros (IDs más altos):');
    highIds.recordset.forEach(row => {
      console.log(`   ID ${row.Id}: "${row.RazonSocial?.substring(0, 60)}"`);
    });
    
    // 6. Verificar si hay algún patrón en los registros faltantes
    const gaps = await extractor.pool.request().query(`
      WITH EmpresaNumbers AS (
        SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as RowNum
        FROM dbo.Empresa
      )
      SELECT TOP 10 Id, Id - RowNum as Gap
      FROM EmpresaNumbers
      WHERE Id - RowNum > 0
      ORDER BY Gap DESC
    `);
    
    console.log('\\n📋 Gaps en los IDs (posibles eliminaciones):');
    if (gaps.recordset.length > 0) {
      gaps.recordset.forEach(row => {
        console.log(`   ID ${row.Id}: Gap de ${row.Gap}`);
      });
    } else {
      console.log('   No se encontraron gaps significativos');
    }
    
  } catch (error) {
    logger.error('❌ Error en análisis:', error);
  } finally {
    await extractor.disconnect();
  }
}

// Ejecutar
analyzeSpecialChars();