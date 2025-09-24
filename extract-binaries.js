import { BinaryExtractor } from "./src/utils/binary-extractor.js";
import fs from "fs/promises";
import path from "path";

/**
 * Script para extraer archivos binarios de SQL Server
 * Paso 1 del proceso de migración de archivos:
 * 1. Extraer archivos binarios físicamente con nombres nanoid
 * 2. Luego ejecutar ETL para migrar metadatos con referencias a archivos extraídos
 */
async function main() {
  console.log("🚀 INICIANDO EXTRACCIÓN DE ARCHIVOS BINARIOS");
  console.log("=".repeat(50));

  try {
    const extractor = new BinaryExtractor();

    // Ejecutar extracción
    const extractedFiles = await extractor.extractAllBinaryFiles();

    // Generar reporte
    extractor.generateExtractionReport(extractedFiles);

    // Guardar información de archivos extraídos para el ETL
    const reportPath = path.join(process.cwd(), "extracted-files-report.json");
    await fs.writeFile(reportPath, JSON.stringify(extractedFiles, null, 2));
    console.log(`📄 Reporte guardado en: ${reportPath}`);

    console.log("\n✅ EXTRACCIÓN COMPLETADA EXITOSAMENTE");
    console.log("👉 Siguiente paso: Ejecutar ETL para migrar metadatos");
  } catch (error) {
    console.error("❌ Error en la extracción:", error);
    process.exit(1);
  }
}

// Ejecutar script
main();
