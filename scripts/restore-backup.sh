#!/bin/bash

# Script para restaurar backup automáticamente
echo "Iniciando proceso de restauración..."

# Variables de entorno  
SA_PASSWORD="4Emperador*"
DB_NAME="SIBNE_ETL"
BACKUP_FILE_NAME="SIBNE_backup_2025_08_29_000002_1942499.bak"

echo "Backup a restaurar: $BACKUP_FILE_NAME"
echo "Base de datos objetivo: $DB_NAME"

# Verificar información del backup
echo "=== Obteniendo información del backup ==="
/opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/backup/$BACKUP_FILE_NAME'"

echo ""
echo "=== Iniciando restauración ==="

# Restaurar base de datos con nombres automáticos
/opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -Q "RESTORE DATABASE [$DB_NAME] FROM DISK = '/var/opt/mssql/backup/$BACKUP_FILE_NAME' WITH REPLACE, STATS = 10"

echo ""
echo "=== Verificando bases de datos ==="
/opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -C -Q "SELECT name FROM sys.databases WHERE name = '$DB_NAME'"

echo "Script de restauración completado"