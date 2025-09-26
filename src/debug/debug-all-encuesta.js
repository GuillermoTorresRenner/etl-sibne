#!/usr/bin/env node

import { verifyMultipleTables } from "./table-verifier.js";

// Definir las tablas Encuesta a verificar
const encuestaTables = [
  {
    name: "Encuesta",
    expectedCount: 9,
    sampleColumns: ["id", "nombre", "anio"],
  },
  {
    name: "EncuestaEmpresa",
    expectedCount: 13511,
    sampleColumns: ["id", "empresaid", "encuestaid"],
  },
  {
    name: "EncuestaPlanta",
    expectedCount: 40460,
    sampleColumns: ["id", "plantaid", "encuestaid"],
  },
  {
    name: "IntensidadEnergEncuestaEmpresa",
    expectedCount: 5518,
    sampleColumns: ["id", "encuestaempresaid"],
  },
];

async function debugAllEncuestaTables() {
  console.log("🔍 DEBUG COMPLETO - TODAS LAS TABLAS ENCUESTA");
  console.log("=============================================\n");

  const report = await verifyMultipleTables(encuestaTables);

  console.log("\n🎯 CONCLUSIONES:");
  if (report.overallSuccess) {
    console.log("✅ Todas las tablas Encuesta se migraron correctamente");
  } else {
    console.log(
      "⚠️ Se detectaron problemas en la migración de tablas Encuesta"
    );
    console.log("📋 Acciones recomendadas:");
    console.log(
      "  1. Verificar que las tablas no estén en DEV_TABLES_TO_EXCLUDE"
    );
    console.log("  2. Verificar que los CSVs se generen correctamente");
    console.log("  3. Revisar logs de migración para errores específicos");
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugAllEncuestaTables();
}
