#!/usr/bin/env node

/**
 * Script para debugear específicamente la tabla Encuesta
 * y encontrar por qué no se está procesando en la migración
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processTable } from "../migrations/final-prisma-migration.js";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function debugEncuestaSpecific() {
  try {
    console.log("🔍 DEBUG ESPECÍFICO - TABLA ENCUESTA");
    console.log("===================================\n");

    // 1. Verificar CSV
    const csvPath = path.join(__dirname, "../../Tablas/dbo_Encuesta.csv");
    console.log("📁 PASO 1: Verificando CSV...");

    if (!fs.existsSync(csvPath)) {
      console.log("❌ CSV no existe:", csvPath);
      return;
    }

    const csvContent = fs.readFileSync(csvPath, "utf8");
    const lines = csvContent.split("\n").filter((line) => line.trim());
    console.log(`✅ CSV encontrado: ${lines.length - 1} registros de datos`);
    console.log(`   📋 Archivo: ${csvPath}`);
    console.log(`   📋 Tamaño: ${fs.statSync(csvPath).size} bytes`);
    console.log(`   📋 Primera línea: ${lines[0]}`);
    if (lines.length > 1) {
      console.log(`   📋 Segunda línea: ${lines[1]}`);
    }

    // 2. Verificar estructura en PostgreSQL
    console.log("\n🐘 PASO 2: Verificando estructura en PostgreSQL...");
    const client = await pool.connect();

    try {
      const tableCheck = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'dbo' AND table_name = 'Encuesta'
        ORDER BY ordinal_position
      `);

      if (tableCheck.rows.length === 0) {
        console.log("❌ Tabla Encuesta no existe en PostgreSQL");
        return;
      }

      console.log(
        `✅ Tabla Encuesta existe con ${tableCheck.rows.length} columnas:`
      );
      tableCheck.rows.forEach((col) => {
        console.log(
          `   • ${col.column_name}: ${col.data_type}${
            col.is_nullable === "NO" ? " NOT NULL" : ""
          }`
        );
      });

      // 3. Verificar datos actuales
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM dbo."Encuesta"'
      );
      console.log(
        `\n📊 Registros actuales en PostgreSQL: ${countResult.rows[0].count}`
      );
    } finally {
      client.release();
    }

    // 4. Intentar procesar la tabla manualmente
    console.log("\n🔧 PASO 3: Intentando procesar tabla manualmente...");
    const client3 = await pool.connect();
    try {
      const result = await processTable(client3, "Encuesta");
      console.log("✅ Procesamiento manual exitoso:", result);
    } catch (error) {
      console.log("❌ Error en procesamiento manual:", error.message);
      console.log("   Stack:", error.stack);
    } finally {
      client3.release();
    }

    // 5. Verificar datos después del procesamiento manual
    console.log("\n📊 PASO 4: Verificando datos después del procesamiento...");
    const client2 = await pool.connect();
    try {
      const finalCount = await client2.query(
        'SELECT COUNT(*) as count FROM dbo."Encuesta"'
      );
      console.log(`   Registros finales: ${finalCount.rows[0].count}`);

      if (finalCount.rows[0].count > 0) {
        const sample = await client2.query(
          'SELECT * FROM dbo."Encuesta" LIMIT 3'
        );
        console.log("   📋 Muestra de datos:");
        sample.rows.forEach((row, idx) => {
          console.log(`   ${idx + 1}. ${JSON.stringify(row)}`);
        });
      }
    } finally {
      client2.release();
    }
  } catch (error) {
    console.error("❌ Error en debug:", error);
  } finally {
    await pool.end();
  }
}

debugEncuestaSpecific();
