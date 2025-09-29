import { Pool } from "pg";
import { config } from "./config/database.js";

const pool = new Pool(config.postgresql);

async function cleanEncuesta() {
  try {
    const client = await pool.connect();

    console.log("🧹 Limpiando tabla Encuesta...");
    await client.query('DELETE FROM dbo."Encuesta"');

    const count = await client.query(
      'SELECT COUNT(*) as count FROM dbo."Encuesta"'
    );
    console.log("📊 Registros después de limpiar:", count.rows[0].count);

    client.release();
    await pool.end();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

cleanEncuesta();
