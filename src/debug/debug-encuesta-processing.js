#!/usr/bin/env node

/**
 * Debug específico para trazar el procesamiento de la tabla Encuesta
 * en la migración final
 */

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function debugEncuestaProcessing() {
  console.log("🔍 DEBUG ESPECÍFICO - PROCESAMIENTO DE ENCUESTA");
  console.log("===============================================\n");

  const client = await pool.connect();

  try {
    // 1. Verificar plan de migración
    console.log("📋 PASO 1: Verificando plan de migración...");
    const migrationPlan = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../prisma-migration-plan.json"),
        "utf8"
      )
    );

    const encuestaTables = [
      "Encuesta",
      "EncuestaEmpresa",
      "EncuestaPlanta",
      "IntensidadEnergEncuestaEmpresa",
    ];

    console.log(
      `✅ Plan cargado: ${migrationPlan.migrationOrder.length} tablas`
    );

    for (const tableName of encuestaTables) {
      const index = migrationPlan.migrationOrder.indexOf(tableName);
      if (index !== -1) {
        console.log(`✅ ${tableName}: posición ${index + 1} en migrationOrder`);
      } else {
        console.log(`❌ ${tableName}: NO ENCONTRADA en migrationOrder`);
      }
    }

    // 2. Verificar archivos CSV
    console.log("\n📁 PASO 2: Verificando archivos CSV...");
    for (const tableName of encuestaTables) {
      const csvPath = path.join(
        __dirname,
        "../../Tablas",
        `dbo_${tableName}.csv`
      );
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, "utf8");
        const lines = csvContent.trim().split("\n");
        console.log(
          `✅ ${tableName}: CSV existe, ${lines.length - 1} registros`
        );
      } else {
        console.log(`❌ ${tableName}: CSV NO EXISTE en ${csvPath}`);
      }
    }

    // 3. Verificar estructura de tablas en PostgreSQL
    console.log("\n🐘 PASO 3: Verificando estructura en PostgreSQL...");
    for (const tableName of encuestaTables) {
      try {
        const result = await client.query(
          `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'dbo' AND table_name = $1
          ORDER BY ordinal_position
        `,
          [tableName]
        );

        if (result.rows.length > 0) {
          console.log(
            `✅ ${tableName}: tabla existe, ${result.rows.length} columnas`
          );
          console.log(
            `   📋 Columnas: ${result.rows
              .slice(0, 3)
              .map((r) => r.column_name)
              .join(", ")}...`
          );
        } else {
          console.log(`❌ ${tableName}: tabla NO EXISTE en PostgreSQL`);
        }
      } catch (error) {
        console.log(
          `❌ ${tableName}: Error verificando estructura - ${error.message}`
        );
      }
    }

    // 4. Simular procesamiento de una tabla específica (Encuesta)
    console.log("\n🔧 PASO 4: Simulando procesamiento de Encuesta...");
    const tableName = "Encuesta";
    const csvPath = path.join(
      __dirname,
      "../../Tablas",
      `dbo_${tableName}.csv`
    );

    if (fs.existsSync(csvPath)) {
      console.log(`✅ Archivo CSV encontrado: ${csvPath}`);

      try {
        const csvContent = fs.readFileSync(csvPath, "utf8");
        const lines = csvContent.trim().split("\n");
        const headers = lines[0].split(",");

        console.log(`✅ CSV leído correctamente`);
        console.log(
          `   📊 Headers: ${headers.slice(0, 3).join(", ")}... (${
            headers.length
          } columnas)`
        );
        console.log(`   📊 Datos: ${lines.length - 1} filas`);

        // Verificar si se puede hacer la query básica
        const countResult = await client.query(
          `SELECT COUNT(*) as count FROM dbo."${tableName}"`
        );
        console.log(
          `✅ Query a tabla exitosa: ${countResult.rows[0].count} registros actuales`
        );

        console.log("\n🎯 DIAGNÓSTICO:");
        console.log("   ✅ Plan de migración: OK");
        console.log("   ✅ Archivo CSV: OK");
        console.log("   ✅ Estructura PostgreSQL: OK");
        console.log("   ✅ Conectividad: OK");
        console.log("\n   🤔 Si todo está OK, el problema debe estar en:");
        console.log("   • La función processCSVWithMapping()");
        console.log("   • La función insertDataBatch()");
        console.log("   • Algún filtro o condición no visible en los logs");
      } catch (error) {
        console.log(`❌ Error procesando CSV: ${error.message}`);
      }
    } else {
      console.log(`❌ Archivo CSV no encontrado`);
    }
  } catch (error) {
    console.error("❌ Error durante debug:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugEncuestaProcessing();
}
