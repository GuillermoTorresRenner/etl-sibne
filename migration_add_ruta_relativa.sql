-- Script de migración para agregar campos de ruta relativa a ArchivoAdjunto existente
-- Este script actualiza la tabla migrada para ser compatible con Multer

-- Paso 1: Agregar nuevas columnas a la tabla existente
ALTER TABLE dbo.ArchivoAdjunto 
ADD COLUMN Location VARCHAR(500),      -- Campo principal para rutas (uploads/files/archivo.pdf)
ADD COLUMN NanoId VARCHAR(20),         -- ID único nanoid
ADD COLUMN RutaRelativa VARCHAR(500);  -- Compatibilidad ETL

-- Paso 2: Actualizar comentarios para documentar los campos
COMMENT ON COLUMN dbo.ArchivoAdjunto.Location IS 'Ruta del archivo para uso en backend (ej: uploads/files/archivo.pdf)';
COMMENT ON COLUMN dbo.ArchivoAdjunto.NanoId IS 'ID único nanoid para compatibilidad con nombres de archivos Multer';
COMMENT ON COLUMN dbo.ArchivoAdjunto.RutaRelativa IS 'Ruta relativa completa para compatibilidad ETL';

-- Paso 3: Crear índices para búsquedas optimizadas
CREATE INDEX idx_archivoadjunto_location ON dbo.ArchivoAdjunto(Location);
CREATE INDEX idx_archivoadjunto_nanoid ON dbo.ArchivoAdjunto(NanoId);
CREATE INDEX idx_archivoadjunto_ruta_relativa ON dbo.ArchivoAdjunto(RutaRelativa);

-- Paso 4: Actualizar registros existentes con rutas predeterminadas
-- (Los archivos extraídos deberán actualizarse manualmente o mediante script de sincronización)
UPDATE dbo.ArchivoAdjunto 
SET Location = CONCAT('uploads/legacy/', Id, '_', NombreArchivo),
    RutaRelativa = CONCAT('extracted_files/legacy_', Id, '_', NombreArchivo),
    NanoId = 'legacy_' || Id
WHERE Location IS NULL;

-- Paso 5: Verificar la actualización
SELECT 
    Id,
    NombreArchivo,
    Location,           -- ✨ Campo principal
    NanoId,
    RutaRelativa,       -- Compatibilidad
    CASE 
        WHEN Location IS NOT NULL THEN '✅ Actualizado'
        ELSE '❌ Pendiente'
    END as Estado
FROM dbo.ArchivoAdjunto
LIMIT 10;