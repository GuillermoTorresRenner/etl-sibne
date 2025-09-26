# Comando Reset - ETL SIBNE

## Descripción
El comando `reset` proporciona una funcionalidad completa de limpieza y reinicio del proyecto ETL SIBNE, preparándolo para una nueva migración desde cero.

## Uso
```bash
npm run reset
```

## Funcionalidades

### 1. Limpieza de Directorios
El reset limpia automáticamente los siguientes directorios:

- `logs/` - Archivos de registro del ETL
- `Archivos/` - Archivos binarios extraídos
- `Tablas/` - Archivos CSV generados
- `Reportes/` - Reportes de migración y comparación

**Características:**
- ✅ Preserva archivos `.gitkeep` para mantener la estructura del repositorio
- 📊 Muestra estadísticas de archivos eliminados y espacio liberado
- 🛡️ Manejo de errores seguro - continúa aunque falle un directorio

### 2. Reset de Base de Datos
Elimina completamente el esquema `dbo` de PostgreSQL:

- 🗑️ Elimina todas las tablas del esquema
- 📊 Muestra conteo de tablas y registros eliminados
- 🔧 Usa `DROP SCHEMA ... CASCADE` para eliminar dependencias
- ✅ Verifica la existencia del esquema antes de eliminar

### 3. Reporte Detallado
Proporciona un resumen completo de las operaciones realizadas:

```
📋 RESUMEN DEL RESET
========================================
🗂️ Directorios limpiados:
   ✅ logs: 2 archivos eliminados
   ✅ Archivos: 44 archivos eliminados  
   ✅ Tablas: 44 archivos eliminados
   ✅ Reportes: 2 archivos eliminados
   📊 Total: 92 archivos eliminados

🗄️ Base de datos:
   ✅ Esquema 'dbo' eliminado: 47 tablas
   📊 Registros eliminados: 19.168

🎯 El proyecto está listo para una nueva migración
```

## Arquitectura Técnica

### Clases Utilizadas

#### `DirectoryManager`
- `cleanDirectory()` - Limpia directorios preservando `.gitkeep`
- `getDirectoryStats()` - Obtiene estadísticas de archivos
- `formatBytes()` - Formatea tamaños de archivo

#### `DatabaseManager`
- `dropSchema()` - Elimina esquema de PostgreSQL
- `getSchemaStats()` - Obtiene estadísticas del esquema

#### `ResetScript`
- Orquesta todo el proceso de reset
- Maneja errores y proporciona logging detallado
- Genera resumen final de operaciones

### Seguridad y Confiabilidad

✅ **Preservación de Git**
- Los archivos `.gitkeep` nunca se eliminan
- La estructura del repositorio se mantiene intacta

✅ **Manejo de Errores**
- Continúa operaciones aunque falle una parte
- Logging detallado de errores y warnings
- Códigos de salida apropiados

✅ **Verificación de Estado**
- Verifica existencia de directorios y esquemas
- Muestra estadísticas antes y después
- Confirmación de operaciones completadas

## Casos de Uso

### Antes de Nueva Migración
```bash
npm run reset      # Limpiar todo
npm run migrate    # Ejecutar migración limpia
```

### Después de Problemas en Migración
```bash
npm run reset      # Limpiar estado inconsistente  
# Revisar configuración
npm run migrate    # Reintentar migración
```

### Limpieza de Desarrollo
```bash
npm run reset      # Limpiar archivos de prueba
```

## Verificación Post-Reset

Para verificar que el reset fue exitoso:

```bash
# Verificar directorios limpios
ls -la logs/ Archivos/ Tablas/ Reportes/

# Verificar base de datos limpia  
npm run compare-db
```

## Logs y Monitoreo

El reset genera logs detallados en la consola:
- 🚀 Inicio del proceso
- 🧹 Limpieza de cada directorio
- 🗄️ Operaciones de base de datos
- 📋 Resumen final con estadísticas

## Integración con Git

El reset es compatible con flujos de trabajo Git:
- Mantiene archivos `.gitkeep` en el repositorio
- No afecta archivos fuente o configuración
- Solo limpia archivos generados por el ETL

---

*Documentación actualizada: 26 de septiembre de 2025*