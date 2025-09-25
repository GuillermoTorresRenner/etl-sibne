# 📋 Estructura del Proyecto SIBNE ETL

## 📁 Organización de Archivos

```
etl-sibne/
├── 🚀 migrate-full.js                # Script principal de migración completa
├── 🔧 docker-compose.yml            # Configuración de contenedores
├── ⚙️  .env                          # Variables de entorno
│
├── 📂 src/                           # Código fuente principal
│   ├── 🔍 analyzers/                 # Analizadores de esquemas
│   │   └── analyze-prisma-schema.js  # Análisis de dependencias Prisma
│   │
│   ├── 🔄 migrations/               # Scripts de migración
│   │   └── final-prisma-migration.js # Migración principal con Prisma
│   │
│   ├── ⚡ processors/               # Procesadores especializados
│   │   └── extract-archivo-adjunto.js # Extractor de archivos binarios
│   │
│   ├── 📊 extractors/               # Extractores de datos
│   │   └── sqlserver-extractor.js   # Extractor SQL Server
│   │
│   ├── 💾 loaders/                  # Cargadores de datos
│   │   └── postgres-loader.js       # Cargador PostgreSQL
│   │
│   ├── 🛠️  utils/                   # Utilidades
│   │   ├── binary-extractor.js      # Extractor de binarios
│   │   ├── logger.js                # Sistema de logging
│   │   └── progress.js              # Indicadores de progreso
│   │
│   ├── ⚙️  config/                  # Configuraciones
│   │   └── database.js              # Configuración de BD
│   │
│   └── 📜 scripts/                  # Scripts auxiliares (legacy)
│
├── 🗃️  schema/                      # Esquemas Prisma
│   ├── schema.prisma                # Schema principal
│   ├── *.prisma                     # Modelos individuales
│   └── migrations/                  # Migraciones Prisma
│
├── 📊 Tablas/                       # Archivos CSV exportados
├── 📁 Archivos/                     # Archivos binarios extraídos
├── 📋 logs/                         # Archivos de log
├── 💾 Backup/                       # Backups de BD
└── 📈 Reportes/                     # Reportes generados
```

## 🚀 Scripts Principales

### Migración Completa

# 🚀 Ejecución

````bash
npm run migrate:full       # Migración completa (recomendado)
npm run migrate           # Migración completa (alias)

### Scripts Específicos
```bash
npm run analyze:schema       # Solo análisis de dependencias Prisma
npm run process:files        # Solo procesamiento de archivos binarios
npm run migrate:legacy       # Sistema de migración anterior
````

## 🔧 Flujo de Trabajo

1. **Análisis**: `src/analyzers/` determina orden de dependencias
2. **Extracción**: `src/extractors/` obtiene datos de SQL Server
3. **Procesamiento**: `src/processors/` maneja archivos especiales
4. **Migración**: `src/migrations/` ejecuta la transferencia ordenada
5. **Carga**: `src/loaders/` inserta en PostgreSQL

## 📋 Funcionalidades

- ✅ **Análisis automático** de dependencias Prisma
- ✅ **Migración ordenada** respetando FK constraints
- ✅ **Extracción de binarios** con nomenclatura única
- ✅ **Procesamiento por lotes** optimizado
- ✅ **Manejo de errores** robusto
- ✅ **Logging detallado** de todo el proceso

## 🎯 Archivos Clave

## 🔧 Archivos Principales

- **`migrate-full.js`**: Script principal de migración completa con todas las funcionalidades
- **`src/migrations/final-prisma-migration.js`**: Motor de migración
- **`src/analyzers/analyze-prisma-schema.js`**: Análisis de esquemas
- **`src/processors/extract-archivo-adjunto.js`**: Procesador de archivos
