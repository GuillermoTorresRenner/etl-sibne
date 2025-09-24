import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

async function checkArchivoAdjuntoSchema() {
  const client = new pg.Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  });

  try {
    await client.connect();
    console.log("✅ Conectado a PostgreSQL");

    // Verificar si la tabla existe y obtener su estructura
    const result = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'dbo' 
            AND table_name = 'ArchivoAdjunto'
            ORDER BY ordinal_position;
        `);

    if (result.rows.length === 0) {
      console.log("❌ La tabla ArchivoAdjunto no existe en el esquema dbo");
    } else {
      console.log("✅ Estructura de la tabla dbo.ArchivoAdjunto:");
      console.log("================================================");
      result.rows.forEach((row) => {
        const length = row.character_maximum_length
          ? `(${row.character_maximum_length})`
          : "";
        const nullable = row.is_nullable === "YES" ? "NULL" : "NOT NULL";
        const defaultVal = row.column_default
          ? ` DEFAULT ${row.column_default}`
          : "";
        console.log(
          `${row.column_name.padEnd(20)} ${row.data_type}${length.padEnd(
            10
          )} ${nullable}${defaultVal}`
        );
      });
    }

    // Verificar si hay datos
    const countResult = await client.query(
      'SELECT COUNT(*) FROM dbo."ArchivoAdjunto"'
    );
    console.log(`\n📊 Registros en la tabla: ${countResult.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

checkArchivoAdjuntoSchema();
