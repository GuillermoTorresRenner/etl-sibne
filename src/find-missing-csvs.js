import { SqlServerExtractor } from "./extractors/sqlserver-extractor.js";
import fs from "fs";

const extractor = new SqlServerExtractor();

async function findMissingCSVs() {
  try {
    console.log("🔍 Obteniendo lista de tablas de SQL Server...");
    const tables = await extractor.getTables();

    console.log("📋 Tablas en SQL Server:", tables.length);

    const csvFiles = fs
      .readdirSync("./Tablas/")
      .filter((f) => f.endsWith(".csv"));
    console.log("📁 CSVs disponibles:", csvFiles.length);

    console.log("\n🔍 TABLAS SIN CSV:");
    const missingTables = [];

    for (const table of tables) {
      const expectedCSV = `dbo_${table.TABLE_NAME}.csv`;
      if (!csvFiles.includes(expectedCSV)) {
        console.log(`  ❌ ${table.TABLE_NAME} (falta ${expectedCSV})`);
        missingTables.push(table.TABLE_NAME);
      }
    }

    console.log(
      `\n📊 Resumen: ${missingTables.length} tablas sin CSV de ${tables.length} totales`
    );

    if (missingTables.length > 0) {
      console.log("\n🔄 Extrayendo tablas faltantes...");
      for (const tableName of missingTables) {
        try {
          console.log(`📦 Extrayendo ${tableName}...`);
          const result = await extractor.extractTableToCSV(tableName, "dbo");
          console.log(`✅ ${tableName}: ${result.processedRows} filas`);
        } catch (error) {
          console.log(`❌ Error extrayendo ${tableName}:`, error.message);
        }
      }
    }

    await extractor.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

findMissingCSVs();
