import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

/**
 * Verifica si una tabla específica se migró correctamente
 * @param {string} tableName - Nombre de la tabla
 * @param {number} expectedCount - Número esperado de registros
 * @param {Array} sampleColumns - Columnas para mostrar en la muestra
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function verifyTableMigration(
  tableName,
  expectedCount,
  sampleColumns = ["id"]
) {
  try {
    const client = await pool.connect();

    console.log(`🔍 Verificando tabla ${tableName}...`);

    // Obtener conteo
    const result = await client.query(
      `SELECT COUNT(*) as count FROM dbo."${tableName}"`
    );
    const count = parseInt(result.rows[0].count);

    console.log(`📊 Registros en PostgreSQL: ${count}`);

    const isCorrect = count === expectedCount;
    if (isCorrect) {
      console.log(
        `✅ ¡${tableName.toUpperCase()} MIGRADA CORRECTAMENTE! (${count}/${expectedCount} registros)`
      );
    } else {
      console.log(
        `⚠️ Diferencia en ${tableName}: ${count} de ${expectedCount} esperados`
      );
    }

    // Mostrar muestra de registros si hay datos
    if (count > 0) {
      const columnsList = sampleColumns.join(", ");
      const sample = await client.query(
        `SELECT ${columnsList} FROM dbo."${tableName}" ORDER BY ${sampleColumns[0]} LIMIT 5`
      );
      console.log(`\n📋 Muestra de registros de ${tableName}:`);
      sample.rows.forEach((row, index) => {
        const rowData = sampleColumns
          .map((col) => `${col}: ${row[col]}`)
          .join(", ");
        console.log(`  ${index + 1}. ${rowData}`);
      });
    }

    client.release();

    return {
      tableName,
      expectedCount,
      actualCount: count,
      isCorrect,
      migrationSuccess: isCorrect,
    };
  } catch (error) {
    console.error(`❌ Error verificando ${tableName}:`, error.message);
    return {
      tableName,
      expectedCount,
      actualCount: 0,
      isCorrect: false,
      migrationSuccess: false,
      error: error.message,
    };
  }
}

/**
 * Verifica múltiples tablas y genera un reporte
 * @param {Array} tables - Array de objetos {name, expectedCount, sampleColumns}
 * @returns {Promise<Object>} Reporte completo
 */
async function verifyMultipleTables(tables) {
  console.log("🔍 VERIFICACIÓN MASIVA DE MIGRACIÓN");
  console.log("====================================\n");

  const results = [];

  for (const table of tables) {
    const result = await verifyTableMigration(
      table.name,
      table.expectedCount,
      table.sampleColumns || ["id"]
    );
    results.push(result);
    console.log(""); // Línea separadora
  }

  // Generar reporte final
  console.log("📊 REPORTE FINAL:");
  console.log("==================");

  const successful = results.filter((r) => r.migrationSuccess);
  const failed = results.filter((r) => !r.migrationSuccess);

  console.log(`✅ Tablas correctas: ${successful.length}/${results.length}`);
  console.log(`❌ Tablas con problemas: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log("\n⚠️ TABLAS CON PROBLEMAS:");
    failed.forEach((table) => {
      console.log(
        `  • ${table.tableName}: ${table.actualCount}/${table.expectedCount} registros`
      );
    });
  }

  await pool.end();

  return {
    totalTables: results.length,
    successfulTables: successful.length,
    failedTables: failed.length,
    results,
    overallSuccess: failed.length === 0,
  };
}

export { verifyTableMigration, verifyMultipleTables };
