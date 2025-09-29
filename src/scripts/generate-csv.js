#!/usr/bin/env node

/**
 * SIBNE ETL - Generador de CSV independiente
 * Extrae una tabla de SQL Server a CSV
 */

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import sql from "mssql";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
import { config } from "../config/database.js";

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

// --- NUEVO: Extraer todas las tablas como en migrate-full ---
const ALL_TABLES = [
  "ArchivoAdjunto",
  "CargaMasivaArchivo",
  "CargaMasivaDetalle",
  "CargaMasivaError",
  "CategoriaTransaccion",
  "Comuna",
  "Contacto",
  "EmailConfig",
  "EmailLogs",
  "Empresa",
  "Encuesta",
  "EncuestaEmpresa",
  "EncuestaPlanta",
  "Energetico",
  "EnergeticoGrupos",
  "EnergeticoUnidadMedida",
  "EstadoEmail",
  "EstadoEmpresa",
  "EstadoProceso",
  "EstadoReporte",
  "FactorConversion",
  "Formulario",
  "IntensidadEnergEncuestaEmpresa",
  "Pais",
  "Planta",
  "Provincia",
  "Region",
  "Reporte",
  "Role",
  "SectorEconomico",
  "SectorEconomicoSii",
  "SectorEnergetico",
  "SubSectorEconomico",
  "Tecnologia",
  "TipoContacto",
  "TipoOtroUso",
  "TipoPerdida",
  "TipoTransporte",
  "TipoUsoProceso",
  "Transaccion",
  "TransaccionIntensidadEnergia",
  "UnidadMedida",
  "Usuario",
  "UsuarioLogin",
  "UsuarioRole",
  "UsuarioToken",
];

const TABLE_NAME_MAPPING = {
  Usuario: "AspNetUsers",
  Role: "AspNetRoles",
  UsuarioRole: "AspNetUserRoles",
  UsuarioLogin: "AspNetUserLogins",
  UsuarioToken: "AspNetUserTokens",
};

async function extractTableToCSV(sqlPool, tableName) {
  try {
    const sourceTableName = TABLE_NAME_MAPPING[tableName] || tableName;
    const tableInfo =
      sourceTableName !== tableName
        ? `${tableName} (${sourceTableName})`
        : tableName;
    const query = `SELECT * FROM dbo.${sourceTableName}`;
    const result = await sqlPool.request().query(query);

    if (result.recordset.length === 0) {
      console.log(`⏭️  Tabla ${tableInfo}: Sin datos (omitida)`);
      logger.info(`Tabla ${tableInfo} sin datos - omitida correctamente`);
      return "empty";
    }

    const headers = Object.keys(result.recordset[0]);
    const csvContent = [
      headers.join(","),
      ...result.recordset.map((row) =>
        headers
          .map((header) => {
            let value = row[header];
            if (value === null || value === undefined) {
              return "";
            }
            if (value instanceof Date) {
              value = value.toISOString();
            } else if (Buffer.isBuffer(value)) {
              return "";
            } else {
              value = value.toString();
            }
            if (typeof value === "string") {
              let escapedValue = value.replace(/"/g, '""');
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

    const csvPath = path.join(
      __dirname,
      "../../Tablas",
      `dbo_${tableName}.csv`
    );
    fs.writeFileSync(csvPath, csvContent, "utf8");

    console.log(
      `✅ ${tableInfo}: ${result.recordset.length} registros extraídos`
    );
    logger.info(
      `Tabla ${tableInfo} extraída: ${result.recordset.length} registros`
    );
    return "success";
  } catch (error) {
    console.error(`❌ Error extrayendo tabla ${tableName}:`, error.message);
    logger.error(`Error extrayendo tabla ${tableName}`, error);
    return "error";
  }
}

// CLI: node src/scripts/generate-csv.js
async function main() {
  let sqlPool;
  try {
    sqlPool = await sql.connect(sqlConfig);
    const total = ALL_TABLES.length;
    let count = 0;
    for (const tableName of ALL_TABLES) {
      await extractTableToCSV(sqlPool, tableName);
      count++;
      console.log(`Progreso: ${count}/${total}`);
    }
    await sqlPool.close();
    console.log("\n✅ Extracción de todas las tablas finalizada.");
  } catch (error) {
    console.error("Error en extracción masiva:", error.message);
    if (sqlPool) await sqlPool.close();
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractTableToCSV };
