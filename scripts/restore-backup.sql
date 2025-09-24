-- Script SQL para restaurar backup
-- Ejecuta este script después de que SQL Server esté funcionando

USE master;
GO

-- Variables (ajusta según tu backup)
DECLARE @BackupFile NVARCHAR(255) = '/var/opt/mssql/backup/tu_backup.bak'
DECLARE @DatabaseName NVARCHAR(128) = 'SIBNE_ETL'
DECLARE @DataPath NVARCHAR(255) = '/var/opt/mssql/data/'

-- Verificar si la base de datos ya existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = @DatabaseName)
BEGIN
    PRINT 'Restaurando backup...'
    
    -- Obtener información del backup
    RESTORE FILELISTONLY FROM DISK = @BackupFile
    
    -- Restaurar la base de datos
    -- NOTA: Ajusta los nombres lógicos según tu backup específico
    RESTORE DATABASE [SIBNE_ETL] 
    FROM DISK = @BackupFile
    WITH REPLACE,
    MOVE 'LogicalDataFileName' TO '/var/opt/mssql/data/SIBNE_ETL.mdf',
    MOVE 'LogicalLogFileName' TO '/var/opt/mssql/data/SIBNE_ETL.ldf',
    STATS = 10
    
    PRINT 'Backup restaurado exitosamente'
END
ELSE
BEGIN
    PRINT 'La base de datos ya existe'
END
GO