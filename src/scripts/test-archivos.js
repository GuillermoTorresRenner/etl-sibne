import runFullMigration from "./migrate-full.js";

async function testArchivoAdjunto() {
  try {
    console.log("🔄 Iniciando migración completa optimizada para pruebas...");
    console.log("⚠️  Nota: Ahora usa el sistema optimizado completo");

    // Ejecutar migración completa optimizada
    await runFullMigration();

    console.log("✅ ¡Migración optimizada completada!");
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
}

testArchivoAdjunto();
