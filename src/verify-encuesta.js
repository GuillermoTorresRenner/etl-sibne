import { Pool } from "pg";
import { config } from "./config/database.js";

const pool = new Pool(config.postgresql);

async function verifyEncuesta() {
  try {
    const client = await pool.connect();

    console.log("🔍 Verificando tabla Encuesta...");

    const result = await client.query(
      'SELECT COUNT(*) as count FROM dbo."Encuesta"'
    );
    const count = parseInt(result.rows[0].count);

    console.log("📊 Registros en PostgreSQL:", count);

    if (count === 9) {
      console.log("✅ ¡ENCUESTA MIGRADA CORRECTAMENTE! (9/9 registros)");
    } else {
      console.log(`⚠️ Diferencia en Encuesta: ${count} de 9 esperados`);
    }

    // Mostrar algunos registros
    const sample = await client.query(
      'SELECT id, nombre, anio FROM dbo."Encuesta" ORDER BY id LIMIT 5'
    );
    console.log("\n📋 Muestra de registros:");
    sample.rows.forEach((row) => {
      console.log(`  ID: ${row.id}, Nombre: ${row.nombre}, Año: ${row.anio}`);
    });

    client.release();
    await pool.end();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

verifyEncuesta();
