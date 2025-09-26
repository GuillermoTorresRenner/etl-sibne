import { ETLPipeline } from "./main.js";

async function testArchivoAdjunto() {
  const pipeline = new ETLPipeline();

  try {
    console.log("🔄 Iniciando migración de prueba para ArchivoAdjunto...");

    // Solo migrar la tabla ArchivoAdjunto
    const options = {
      tablesFilter: ["ArchivoAdjunto"], // Solo los nombres de tabla
      mode: "csv",
      parallel: false, // Para pruebas, mejor secuencial
    };
    await pipeline.run(options);

    console.log("✅ ¡Migración de ArchivoAdjunto completada!");
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
}

testArchivoAdjunto();
