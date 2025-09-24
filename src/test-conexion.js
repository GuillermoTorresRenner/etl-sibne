#!/usr/bin/env node

/**
 * Script de prueba de conexión a las bases de datos
 * Verifica que tanto SQL Server como PostgreSQL estén accesibles
 */

import { SqlServerExtractor } from "./extractors/sqlserver-extractor.js";
import { PostgreSQLLoader } from "./loaders/postgres-loader.js";
import { logger } from "./utils/logger.js";
import { config, validateConfig } from "./config/database.js";

async function probarConexiones() {
  logger.info("🔍 PROBANDO CONEXIONES DE BASE DE DATOS");
  logger.info("=====================================");

  try {
    // Validar configuración
    validateConfig();
    logger.info("✅ Configuración validada");

    // Probar SQL Server
    await probarSQLServer();

    // Probar PostgreSQL
    await probarPostgreSQL();

    logger.info("🎉 ¡Todas las conexiones funcionan correctamente!");
    process.exit(0);
  } catch (error) {
    logger.error("💥 Error en pruebas de conexión:", error);
    process.exit(1);
  }
}

async function probarSQLServer() {
  logger.info("🔵 Probando conexión a SQL Server...");

  const extractor = new SqlServerExtractor();

  try {
    await extractor.connect();

    // Obtener información básica
    const tables = await extractor.getTables();
    logger.info(
      `✅ SQL Server conectado - ${tables.length} tablas encontradas`
    );

    // Mostrar algunas tablas de ejemplo
    if (tables.length > 0) {
      logger.info("📋 Primeras 5 tablas:");
      tables.slice(0, 5).forEach((table, index) => {
        logger.info(
          `   ${index + 1}. ${table.TABLE_SCHEMA}.${table.TABLE_NAME}`
        );
      });
    }

    await extractor.disconnect();
  } catch (error) {
    logger.error("❌ Error conectando a SQL Server:", {
      host: config.sqlServer.server,
      port: config.sqlServer.port,
      database: config.sqlServer.database,
      error: error.message,
    });
    throw error;
  }
}

async function probarPostgreSQL() {
  logger.info("🟢 Probando conexión a PostgreSQL...");

  const loader = new PostgreSQLLoader();

  try {
    // Crear base de datos si no existe
    await loader.createDatabaseIfNotExists();

    // Conectar
    await loader.connect();

    // Probar consulta básica
    const client = await loader.pool.connect();
    const result = await client.query(
      "SELECT version() as version, now() as timestamp"
    );
    client.release();

    logger.info("✅ PostgreSQL conectado exitosamente");
    logger.info(
      `📊 Versión: ${result.rows[0].version.split(" ").slice(0, 2).join(" ")}`
    );
    logger.info(`⏰ Timestamp: ${result.rows[0].timestamp}`);

    await loader.disconnect();
  } catch (error) {
    logger.error("❌ Error conectando a PostgreSQL:", {
      host: config.postgresql.host,
      port: config.postgresql.port,
      database: config.postgresql.database,
      user: config.postgresql.user,
      error: error.message,
    });
    throw error;
  }
}

async function probarMigracionTabla() {
  logger.info("🧪 Probando migración de una tabla pequeña...");

  const extractor = new SqlServerExtractor();
  const loader = new PostgreSQLLoader();

  try {
    await extractor.connect();
    await loader.createDatabaseIfNotExists();
    await loader.connect();

    // Obtener lista de tablas y encontrar una pequeña
    const tables = await extractor.getTables();

    let tablaSeleccionada = null;
    let menorConteo = Infinity;

    // Buscar la tabla más pequeña (máximo 1000 registros)
    for (const table of tables.slice(0, 10)) {
      // Solo revisar las primeras 10
      try {
        const count = await extractor.getTableCount(
          table.TABLE_NAME,
          table.TABLE_SCHEMA
        );
        if (count > 0 && count < menorConteo && count <= 1000) {
          menorConteo = count;
          tablaSeleccionada = table;
        }
      } catch (error) {
        // Continuar con la siguiente tabla si hay error
        continue;
      }
    }

    if (!tablaSeleccionada) {
      logger.warn("⚠️ No se encontró una tabla pequeña para prueba");
      return;
    }

    logger.info(
      `🎯 Probando con tabla: ${tablaSeleccionada.TABLE_SCHEMA}.${tablaSeleccionada.TABLE_NAME} (${menorConteo} filas)`
    );

    // Obtener estructura de la tabla
    const columns = await extractor.getTableInfo(
      tablaSeleccionada.TABLE_NAME,
      tablaSeleccionada.TABLE_SCHEMA
    );

    // Crear tabla en PostgreSQL
    await loader.createTable(
      tablaSeleccionada.TABLE_NAME,
      columns,
      tablaSeleccionada.TABLE_SCHEMA
    );

    // Migrar datos
    const streamData = await extractor.extractTableStream(
      tablaSeleccionada.TABLE_NAME,
      tablaSeleccionada.TABLE_SCHEMA
    );

    logger.info(`🔍 Tipo de stream recibido:`, {
      hasStream: !!streamData.stream,
      streamType: typeof streamData.stream,
      streamConstructor: streamData.stream?.constructor?.name,
      methods: streamData.stream
        ? Object.getOwnPropertyNames(streamData.stream.__proto__)
        : "none",
    });

    const result = await loader.loadFromStream(
      streamData.stream,
      tablaSeleccionada.TABLE_NAME,
      columns,
      tablaSeleccionada.TABLE_SCHEMA
    );

    logger.info(`✅ Migración de prueba exitosa: ${result.rowsLoaded} filas`);

    await extractor.disconnect();
    await loader.disconnect();
  } catch (error) {
    logger.error("❌ Error en migración de prueba:", error);
    throw error;
  }
}

// Ejecutar según argumentos
const modo = process.argv[2];

switch (modo) {
  case "conexion":
  case "conexiones":
    probarConexiones();
    break;
  case "migracion":
  case "prueba":
    probarMigracionTabla();
    break;
  default:
    console.log(`
🧪 SCRIPT DE PRUEBAS ETL SIBNE

Uso: node src/test-conexion.js [modo]

Modos disponibles:
  conexion    - Probar solo las conexiones a ambas bases de datos
  migracion   - Probar migración completa de una tabla pequeña

Ejemplos:
  node src/test-conexion.js conexion
  node src/test-conexion.js migracion
    `);
    process.exit(0);
}
