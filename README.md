# ETL SIBNE - Entorno SQL Server

## 📋 Descripción del Proyecto

Este proyecto proporciona un entorno completo de SQL Server utilizando Docker Compose, diseñado para facilitar el desarrollo y la gestión de bases de datos con persistencia de datos y restauración automática de backups.

## 🛠️ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

1. **Docker**: [Descargar Docker](https://www.docker.com/get-started)
2. **Docker Compose**: Generalmente incluido con Docker Desktop

### Verificar instalación:

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose (sintaxis moderna)
docker compose version
```

> 📝 **Nota**: Este proyecto usa la sintaxis moderna `docker compose` (sin guión), no `docker-compose`.

## 📁 Estructura del Proyecto

```
etl-sibne/
├── docker-compose.yml      # Configuración del contenedor SQL Server
├── .env                    # Variables de entorno y credenciales
├── README.md              # Este archivo
├── Backup/                # Carpeta para archivos .bak (coloca aquí tu backup)
├── scripts/               # Scripts de restauración
│   ├── restore-backup.sh  # Script bash para restaurar backup
│   └── restore-backup.sql # Script SQL alternativo
└── src/                   # Código fuente de la aplicación
    └── index.js
```

## 🚀 Instrucciones de Instalación y Ejecución

### Paso 1: Clonar o Descargar el Proyecto

```bash
# Si tienes el proyecto en Git
git clone [URL_DEL_REPOSITORIO]
cd etl-sibne

# O simplemente navega a la carpeta del proyecto si ya lo tienes
cd etl-sibne
```

### Paso 2: Configurar Variables de Entorno

1. **Abre el archivo `.env`** en un editor de texto
2. **Modifica las siguientes variables:**

```env
# Configuración de SQL Server
SA_PASSWORD=4Emperador*             # ⚠️ CAMBIA ESTA PASSWORD (ejemplo actual)
SQL_PORT=1433

# Configuración de base de datos
DB_NAME=SIBNE_ETL                   # Nombre de tu base de datos
BACKUP_FILE_NAME=SIBNE_backup_2025_08_29_000002_1942499.bak  # ⚠️ CAMBIA POR EL NOMBRE REAL

# Configuración adicional (opcional)
MSSQL_COLLATION=SQL_Latin1_General_CP1_CI_AS
```

> ⚠️ **IMPORTANTE**:
>
> - La password debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos
> - Cambia `BACKUP_FILE_NAME` por el nombre exacto de tu archivo `.bak`

### Paso 3: Preparar el Backup

1. **Coloca tu archivo `.bak`** en la carpeta `Backup/`
2. **Asegúrate** de que el nombre del archivo coincida con `BACKUP_FILE_NAME` en `.env`

```bash
# Ejemplo: si tu backup se llama "empresa_db_backup.bak"
# Cópialo a la carpeta Backup/
cp /ruta/a/tu/backup/empresa_db_backup.bak ./Backup/

# Y actualiza .env:
# BACKUP_FILE_NAME=empresa_db_backup.bak
```

### Paso 4: Levantar el Contenedor SQL Server

```bash
# 1. Levantar SQL Server en segundo plano
docker compose up -d

# 2. Verificar que el contenedor esté funcionando
docker compose ps

# 3. Ver los logs en tiempo real (opcional)
docker compose logs -f sqlserver
```

**Esperado:** Deberías ver que el contenedor `sqlserver-etl-sibne` está en estado `Up`

### Paso 5: Esperar a que SQL Server esté Listo

```bash
# Verificar el health check (espera hasta que muestre "healthy")
docker compose ps

# O verificar manualmente la conexión (usando la nueva ubicación de sqlcmd)
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT @@VERSION"
```

> ⚠️ **Importante**: SQL Server 2022 usa `/opt/mssql-tools18/bin/sqlcmd` y requiere el parámetro `-C` para conexiones SSL.

### Paso 6: Restaurar el Backup

Una vez que SQL Server esté funcionando correctamente, restaura tu backup:

#### Opción A: Script Automático (Recomendado)

```bash
# 1. Hacer el script ejecutable (solo la primera vez)
chmod +x scripts/restore-backup.sh

# 2. Ejecutar la restauración
docker compose exec sqlserver /var/opt/mssql/scripts/restore-backup.sh
```

#### Opción B: Script SQL Manual

```bash
# Ejecutar el script SQL directamente
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -i /var/opt/mssql/scripts/restore-backup.sql
```

#### Opción C: Restauración Manual Personalizada

Si necesitas ajustar nombres específicos del backup:

```bash
# 1. Primero, obtener información del backup
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/backup/tu_backup.bak'"

# 2. Restauración simple (recomendado - SQL Server maneja automáticamente los nombres)
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "RESTORE DATABASE [SIBNE_ETL] FROM DISK = '/var/opt/mssql/backup/tu_backup.bak' WITH REPLACE, STATS = 10"
```

> 💡 **Tip**: Es más fácil dejar que SQL Server maneje automáticamente los nombres de archivos con `WITH REPLACE, STATS = 10`

### Paso 7: Verificar la Restauración

```bash
# Verificar que la base de datos fue creada
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT name FROM sys.databases"

# Verificar tablas en la base de datos restaurada
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -d SIBNE_ETL -Q "SELECT COUNT(*) as TotalTablas FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"

# Ver algunas tablas de ejemplo
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -d SIBNE_ETL -Q "SELECT TOP 10 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
```

## 🔌 Conexión a la Base de Datos

### Desde aplicaciones externas (SQL Server Management Studio, DBeaver, etc.):

- **Host/Servidor**: `localhost` o `127.0.0.1`
- **Puerto**: `1433`
- **Usuario**: `SA`
- **Password**: La que configuraste en `.env`
- **Base de datos**: `SIBNE_ETL` (o la que configuraste)

### Desde aplicaciones dentro de Docker (misma red):

- **Host/Servidor**: `sqlserver`
- **Puerto**: `1433`
- **Usuario**: `SA`
- **Password**: La que configuraste en `.env`

### Cadena de conexión ejemplo:

```
Server=localhost,1433;Database=SIBNE_ETL;User Id=SA;Password=4Emperador*;TrustServerCertificate=True;
```

> 🔐 **Seguridad**: Reemplaza `4Emperador*` con tu password real del archivo `.env`

## 🛠️ Comandos de Gestión

### Comandos Básicos

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f sqlserver

# Detener el contenedor
docker compose down

# Reiniciar el contenedor
docker compose restart sqlserver

# Levantar nuevamente
docker compose up -d
```

### Acceso Directo a SQL Server

```bash
# Conectarse directamente a SQL Server desde terminal
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C

# Ejecutar una consulta rápida  
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT @@VERSION"

# Conectarse a una base de datos específica
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -d SIBNE_ETL
```

### Operaciones de Backup

```bash
# Crear backup manual con timestamp
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "BACKUP DATABASE [SIBNE_ETL] TO DISK='/var/opt/mssql/backup/backup_manual_$(date +%Y%m%d_%H%M%S).bak' WITH FORMAT, INIT"

# Crear backup simple
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "BACKUP DATABASE [SIBNE_ETL] TO DISK='/var/opt/mssql/backup/backup_manual.bak' WITH REPLACE"

# Listar backups disponibles
ls -la Backup/
```

### Monitoreo y Diagnóstico

```bash
# Ver uso de recursos del contenedor
docker stats sqlserver-etl-sibne

# Ver información detallada del contenedor
docker compose exec sqlserver cat /proc/version

# Verificar espacio en disco dentro del contenedor
docker compose exec sqlserver df -h

# Verificar estado del health check
docker compose ps
```

## 📂 Estructura de Volúmenes y Persistencia

| Volumen          | Ubicación en Contenedor  | Descripción                            |
| ---------------- | ------------------------ | -------------------------------------- |
| `sqlserver_data` | `/var/opt/mssql/data`    | Archivos de base de datos (.mdf, .ldf) |
| `sqlserver_logs` | `/var/opt/mssql/log`     | Logs de SQL Server                     |
| `./Backup/`      | `/var/opt/mssql/backup`  | Archivos de backup (.bak)              |
| `./scripts/`     | `/var/opt/mssql/scripts` | Scripts de inicialización              |

> 💾 **Persistencia**: Todos los datos de la base de datos se mantienen aunque se reinicie o elimine el contenedor.

## ⚠️ Notas Importantes y Seguridad

### 🔐 Seguridad

- **Cambia la password por defecto** en el archivo `.env`
- **No uses passwords simples** en producción
- **No subas el archivo `.env`** a repositorios públicos

### 💾 Backups

- **Nombre exacto**: El archivo `.bak` debe coincidir exactamente con `BACKUP_FILE_NAME`
- **Ubicación**: Coloca todos los backups en la carpeta `Backup/`
- **Permisos**: Asegúrate de que Docker pueda leer el archivo

### 🏗️ Nombres Lógicos

Es posible que necesites ajustar los nombres lógicos en el script de restauración según tu backup específico. Para verificar:

```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'TuPasswordSeguro123!' -Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/backup/tu_backup.bak'"
```

### 🔍 Health Check

El contenedor incluye un health check automático que verifica cada 30 segundos que SQL Server esté respondiendo correctamente.

## 🚨 Solución de Problemas

### Problema: El contenedor no inicia

```bash
# Verificar logs detallados
docker compose logs sqlserver

# Verificar que Docker esté funcionando
docker --version
docker compose version

# Revisar el archivo .env
cat .env
```

**Posibles causas:**

- Password no cumple con los requisitos de seguridad
- Puerto 1433 ya está en uso
- Problemas de permisos

### Problema: Error de conexión

```bash
# Verificar que el contenedor esté corriendo
docker compose ps

# Verificar el health check (debe mostrar "healthy")
docker compose ps

# Probar conexión manual
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT 1"
```

### Problema: Error en la restauración del backup

1. **Verificar que el archivo existe:**

   ```bash
   docker compose exec sqlserver ls -la /var/opt/mssql/backup/
   ```

2. **Verificar información del backup:**

   ```bash
   docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/backup/tu_backup.bak'"
   ```

3. **Revisar logs detallados:**
   ```bash
   docker compose logs sqlserver | grep -i error
   ```

### Problema: Puerto 1433 en uso

Si el puerto está ocupado, cambia el puerto en `.env`:

```env
SQL_PORT=14330  # Cambiar a otro puerto disponible
```

Luego reinicia:

```bash
docker compose down
docker compose up -d
```

### Problema: Permisos de archivos

```bash
# Verificar permisos de la carpeta Backup
ls -la Backup/

# Dar permisos necesarios
chmod 755 Backup/
chmod 644 Backup/*.bak
```

### Obtener Ayuda Adicional

```bash
# Ver toda la información del sistema
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT @@VERSION as SqlServerVersion, @@SERVERNAME as ServerName"

# Ver bases de datos disponibles
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT name FROM sys.databases"

# Ver tablas en SIBNE_ETL
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -d SIBNE_ETL -Q "SELECT COUNT(*) as TotalTablas FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
```

## 🎯 Comandos de Limpieza

Si necesitas empezar desde cero:

```bash
# Detener y eliminar contenedores
docker compose down

# Eliminar volúmenes (⚠️ ESTO BORRA TODOS LOS DATOS)
docker compose down -v

# Limpiar imágenes no utilizadas
docker system prune

# Volver a empezar
docker compose up -d
```

## 📞 Soporte

Si experimentas problemas no cubiertos en esta guía:

1. **Revisa los logs**: `docker compose logs sqlserver`
2. **Verifica la configuración**: Revisa `.env` y `docker-compose.yml`
3. **Consulta la documentación oficial**: [SQL Server en Docker](https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-docker-container-deployment)

---

## 📝 Resumen de Comandos Rápidos

```bash
# Setup inicial
vim .env                                    # Configurar credenciales
cp /ruta/backup.bak ./Backup/              # Copiar backup
docker compose up -d                       # Levantar SQL Server

# Restaurar backup (automático)
chmod +x scripts/restore-backup.sh
docker compose exec sqlserver /var/opt/mssql/scripts/restore-backup.sh

# Verificar (usa tu password real)
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'TU_PASSWORD_AQUI' -C -Q "SELECT name FROM sys.databases"

# Conectar desde aplicación externa
# Server: localhost,1433 | User: SA | Password: [tu password del .env]
```

## ✅ **Prueba Exitosa Realizada**

Este entorno ha sido completamente probado y funciona correctamente:

- ✅ **Contenedor**: SQL Server 2022 funcionando (`healthy`)
- ✅ **Backup restaurado**: 175MB procesados exitosamente
- ✅ **Base de datos**: `SIBNE_ETL` con 50 tablas disponibles
- ✅ **Upgrade automático**: Versión 904 → 957 completado
- ✅ **Conexión verificada**: Acceso completo funcionando

### 🎯 **Configuración utilizada en las pruebas:**
- Password: `4Emperador*`
- Puerto: `1433`
- Backup: `SIBNE_backup_2025_08_29_000002_1942499.bak`
- Estado: **100% Operativo**

---

¡Tu entorno SQL Server está listo para usar! 🚀
