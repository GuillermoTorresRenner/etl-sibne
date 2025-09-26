#!/usr/bin/env node

/**
 * Script para probar solo la extracción de tablas Encuesta
 * Verificar que el formato CSV esté corregido
 */

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de SQL Server
const sqlConfig = {
  user: "sa",
  password: process.env.SA_PASSWORD,
  server: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Tablas Encuesta a probar
const ENCUESTA_TABLES = [
  "Encuesta",
  "EncuestaEmpresa",
  "EncuestaPlanta",
  "IntensidadEnergEncuestaEmpresa",
];

// Función para extraer tabla a CSV (versión corregida)
async function extractTableToCSV(sqlPool, tableName) {
  try {
    const query = `SELECT * FROM dbo.${tableName}`;
    const result = await sqlPool.request().query(query);

    if (result.recordset.length === 0) {
      console.log(`⏭️  Tabla ${tableName}: Sin datos (omitida)`);
      return "empty";
    }

    // Crear CSV con lógica corregida
    const headers = Object.keys(result.recordset[0]);
    const csvContent = [
      headers.join(","),
      ...result.recordset.map((row) =>
        headers
          .map((header) => {
            let value = row[header];
            // Manejar valores especiales
            if (value === null || value === undefined) {
              return "";
            }

            // Convertir a string si no lo es
            if (value instanceof Date) {
              value = value.toISOString();
            } else if (Buffer.isBuffer(value)) {
              return ""; // Omitir binarios en CSV normal
            } else {
              value = value.toString();
            }

            // Manejar campos de texto con caracteres especiales
            if (typeof value === "string") {
              // Escapar comillas dobles
              let escapedValue = value.replace(/"/g, '""');

              // Si contiene comas, comillas, o saltos de línea, envolver en comillas
              if (
                value.includes(",") ||
                value.includes('"') ||
                value.includes("\n") ||
                value.includes("\r")
              ) {
                return `"${escapedValue}"`;
              }
              return escapedValue;
            }

            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Guardar archivo en la carpeta raíz Tablas/
    const csvPath = path.join(
      __dirname,
      "../../Tablas",
      `dbo_${tableName}.csv`
    );
    fs.writeFileSync(csvPath, csvContent, "utf8");

    console.log(
      `✅ ${tableName}: ${result.recordset.length} registros extraídos`
    );

    // Verificar las primeras líneas del CSV
    const lines = csvContent.split("\n");
    console.log(`   📋 Header: ${lines[0]}`);
    if (lines.length > 1) {
      console.log(
        `   📋 Primera fila: ${lines[1].substring(0, 100)}${
          lines[1].length > 100 ? "..." : ""
        }`
      );
    }

    return "success";
  } catch (error) {
    console.error(`❌ Error extrayendo tabla ${tableName}:`, error.message);
    return "error";
  }
}

async function testEncuestaExtraction() {
  let sqlPool;

  try {
    console.log("🔄 Iniciando prueba de extracción de tablas Encuesta...\n");

    // Conectar a SQL Server
    sqlPool = await sql.connect(sqlConfig);
    console.log("✅ Conectado a SQL Server\n");

    // Extraer cada tabla Encuesta
    for (const tableName of ENCUESTA_TABLES) {
      console.log(`📊 Procesando tabla: ${tableName}`);
      const result = await extractTableToCSV(sqlPool, tableName);
      console.log("");
    }

    console.log("🎉 Extracción de tablas Encuesta completada!");
  } catch (error) {
    console.error("❌ Error durante la extracción:", error);
  } finally {
    if (sqlPool) {
      await sqlPool.close();
    }
  }
}

// Ejecutar test
testEncuestaExtraction();
