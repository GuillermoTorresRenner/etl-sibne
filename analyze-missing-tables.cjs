// Análisis de tablas faltantes
const dbTables = [
  'ArchivoAdjunto', 'CargaMasivaArchivo', 'CargaMasivaDetalle', 'CargaMasivaError',
  'CategoriaTransaccion', 'Comuna', 'Contacto', 'EmailConfig', 'EmailLogs',
  'Empresa', 'Encuesta', 'EncuestaEmpresa', 'EncuestaPlanta', 'Energetico',
  'EnergeticoGrupos', 'EnergeticoUnidadMedida', 'EstadoEmail', 'EstadoEmpresa',
  'EstadoProceso', 'EstadoReporte', 'FactorConversion', 'Formulario',
  'IntensidadEnergEncuestaEmpresa', 'Pais', 'Planta', 'Provincia', 'Region',
  'Reporte', 'SectorEconomico', 'SectorEconomicoSii', 'SectorEnergetico',
  'SubSectorEconomico', 'Tecnologia', 'TipoContacto', 'TipoOtroUso',
  'TipoPerdida', 'TipoTransporte', 'TipoUsoProceso', 'Transaccion',
  'TransaccionIntensidadEnergia', 'UnidadMedida',
  // Tablas ASP.NET Identity (mapeadas)
  'AspNetUsers', 'AspNetRoles', 'AspNetUserRoles'
];

const prismaFiles = [
  'ArchivoAdjunto', 'CargaMasivaArchivo', 'CargaMasivaDetalle', 'CargaMasivaError',
  'CategoriaTransaccion', 'Comuna', 'Contacto', 'EmailConfig', 'EmailLogs',
  'Empresa', 'Encuesta', 'EncuestaEmpresa', 'EncuestaPlanta', 'Energetico',
  'EnergeticoGrupos', 'EnergeticoUnidadMedida', 'EstadoEmail', 'EstadoEmpresa',
  'EstadoProceso', 'EstadoReporte', 'FactorConversion', 'Formulario',
  'IntensidadEnergEncuestaEmpresa', 'Pais', 'Planta', 'Provincia', 'Region',
  'Reporte', 'SectorEconomico', 'SectorEconomicoSii', 'SectorEnergetico',
  'SubSectorEconomico', 'Tecnologia', 'TipoContacto', 'TipoOtroUso',
  'TipoPerdida', 'TipoTransporte', 'TipoUsoProceso', 'Transaccion',
  'TransaccionIntensidadEnergia', 'UnidadMedida', 'Users',
  // Modelos mapeados
  'Usuario', 'Role', 'UsuarioRole'
];

console.log('🔍 ANÁLISIS DE TABLAS FALTANTES\n');

// Crear mapeo de equivalencias
const mapping = {
  'AspNetUsers': 'Usuario',
  'AspNetRoles': 'Role', 
  'AspNetUserRoles': 'UsuarioRole'
};

// Tablas ignoradas (sistema)
const ignoredTables = ['__EFMigrationsHistory', 'sysdiagrams', 'AspNetRoleClaims', 
                      'AspNetUserClaims', 'AspNetUserLogins', 'AspNetUserTokens'];

// Buscar tablas sin modelo
const missingModels = [];
dbTables.forEach(table => {
  if (ignoredTables.includes(table)) return;
  
  const modelName = mapping[table] || table;
  if (!prismaFiles.includes(modelName)) {
    missingModels.push(table);
  }
});

console.log('✅ TABLAS PRINCIPALES CON MODELO:');
let covered = 0;
dbTables.forEach(table => {
  if (ignoredTables.includes(table)) return;
  const modelName = mapping[table] || table;
  if (prismaFiles.includes(modelName)) {
    console.log(`   ✅ ${table} → ${modelName}.prisma`);
    covered++;
  }
});

if (missingModels.length > 0) {
  console.log('\n❌ TABLAS SIN MODELO PRISMA:');
  missingModels.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table}`);
  });
} else {
  console.log('\n🎉 ¡Todas las tablas principales tienen modelo Prisma!');
}

console.log(`\n📊 ESTADÍSTICAS:`);
console.log(`   - Tablas principales: ${dbTables.length - ignoredTables.length}`);
console.log(`   - Tablas con modelo: ${covered}`);
console.log(`   - Tablas sin modelo: ${missingModels.length}`);
console.log(`   - Archivos .prisma: ${prismaFiles.length}`);