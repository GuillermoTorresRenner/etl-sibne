import { ETLPipeline } from "./src/etl-pipeline.js";

async function testArchivoAdjunto() {
  const pipeline = new ETLPipeline();

  try {
    console.log("🔄 Iniciando migración de prueba para ArchivoAdjunto...");

    // Solo migrar la tabla ArchivoAdjunto
    const tablesToMigrate = ["dbo.ArchivoAdjunto"];
    await pipeline.run(tablesToMigrate);

    console.log("✅ ¡Migración de ArchivoAdjunto completada!");
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
}

testArchivoAdjunto();
