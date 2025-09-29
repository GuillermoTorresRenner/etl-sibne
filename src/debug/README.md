# 🔧 Carpeta Debug - SIBNE ETL

Esta carpeta contiene herramientas para debug y análisis incremental de tablas individuales.

## 📁 Estructura

```
src/debug/
├── README.md              # Este archivo
├── debug-template.js      # Plantilla base para debug
├── debug-[TABLA].js       # Archivos específicos por tabla
└── results/              # Resultados de análisis (opcional)
```

## 🎯 Propósito

1. **🔍 Análisis tabla por tabla** basado en resultados de `compare-db`
2. **🧪 Pruebas aisladas** sin afectar el flujo principal
3. **✅ Validación de correcciones** antes de integrar
4. **📊 Comparación de estructuras** SQL Server vs PostgreSQL

## 🚀 Uso

### 1. Crear archivo de debug para una tabla:

```bash
# Copiar plantilla
cp src/debug/debug-template.js src/debug/debug-ArchivoAdjunto.js

# Editar para tabla específica
# Modificar lógica según necesidades
```

### 2. Ejecutar debug:

```bash
node src/debug/debug-ArchivoAdjunto.js
```

### 3. Analizar resultados:

- Comparar estructuras de columnas
- Verificar tipos de datos
- Identificar discrepancias
- Probar correcciones

### 4. Integrar al flujo principal:

Una vez validadas las correcciones, migrar los cambios a:

- `src/scripts/migrate-full.js`
- `src/loaders/postgres-loader.js`
- Otros archivos relevantes

## 📋 Workflow Recomendado

```bash
# 1. Ejecutar compare-db para identificar diferencias
npm run compare-db

# 2. Crear archivo debug para tabla problemática
cp src/debug/debug-template.js src/debug/debug-[TABLA].js

# 3. Modificar archivo para casos específicos
# Agregar lógica de análisis y corrección

# 4. Ejecutar debug
node src/debug/debug-[TABLA].js

# 5. Si funciona, integrar al flujo principal
# Migrar cambios a migrate-full.js

# 6. Probar migración completa
npm run migrate
```

## ⚠️ Importante

- **NO modificar el flujo principal** hasta validar en debug
- **Mantener respaldos** de la base estable actual
- **Documentar hallazgos** en cada archivo debug
- **Probar incremental** antes de integrar

## 📝 Convenciones de Código

### SQL Server:

```javascript
// ✅ Correcto
const result = await this.sqlExtractor.pool.request().query(`
  SELECT COUNT(*) as total FROM dbo.TableName
`);
```

### PostgreSQL:

```javascript
// ✅ Correcto - usar comillas dobles y nombres en minúsculas
const result = await this.pgLoader.executeQuery(`
  SELECT COUNT(*) as total FROM dbo."TableName"
`);

// ✅ Para columnas específicas
const result = await this.pgLoader.executeQuery(`
  SELECT "id", "nombre", "email" FROM dbo."Contacto"
`);
```

### Variables:

```javascript
// ✅ Correcto
const tableDebugger = new TableDebugger();

// ❌ Incorrecto - "debugger" es palabra reservada
const debugger = new TableDebugger();
```

## 🛡️ Preservación del Estado Estable

Esta carpeta existe para **proteger la base sólida** que se ha construido. Permite experimentar sin riesgo de romper el flujo principal que ya funciona correctamente.
