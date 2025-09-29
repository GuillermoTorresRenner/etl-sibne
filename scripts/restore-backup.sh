#!/bin/bash
set -e

# ===============================
# Script de restauración de backup
# ===============================

# Directorio raíz del proyecto (carpeta padre del script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Verificar existencia de .env
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ No se encontró el archivo .env en $ENV_FILE"
  exit 1
fi

# Cargar variables desde .env
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Validar que las variables necesarias existen
if [ -z "$SA_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$BACKUP_FILE_NAME" ]; then
  echo "❌ Faltan variables requeridas en el .env"
  echo "   Necesarias: SA_PASSWORD, DB_NAME, BACKUP_FILE_NAME"
  exit 1
fi

echo "🚀 Iniciando proceso de restauración..."
echo "📂 Backup a restaurar: $BACKUP_FILE_NAME"
echo "🗄  Base de datos objetivo: $DB_NAME"

# Nombre del contenedor SQL Server (según docker-compose.yml)
CONTAINER_NAME="sqlserver-etl-sibne"

# Verificar información del backup
echo ""
echo "=== 📋 Obteniendo información del backup ==="
docker exec -i "$CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U SA -P "$SA_PASSWORD" -C \
  -Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/backup/$BACKUP_FILE_NAME'"

# Restaurar base de datos
echo ""
echo "=== 🔄 Iniciando restauración ==="
docker exec -i "$CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U SA -P "$SA_PASSWORD" -C \
  -Q "RESTORE DATABASE [$DB_NAME] FROM DISK = '/var/opt/mssql/backup/$BACKUP_FILE_NAME' WITH REPLACE, STATS = 10"

# Verificar que la DB quedó restaurada
echo ""
echo "=== ✅ Verificando bases de datos ==="
docker exec -i "$CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U SA -P "$SA_PASSWORD" -C \
  -Q "SELECT name FROM sys.databases WHERE name = '$DB_NAME'"

echo ""
echo "🎉 Script de restauración completado con éxito"
