import { Client } from "pg";
import { config } from "../config/database.js";
import { logger } from "./logger.js";

/**
 * Utilidades para operaciones de base de datos
 */
export class DatabaseManager {
  /**
   * Eliminar esquema completo de PostgreSQL
   */
  static async dropSchema(schemaName = "dbo") {
    let client;

    try {
      logger.info(`🗑️ Eliminando esquema: ${schemaName}`);

      // Crear conexión a PostgreSQL
      client = new Client({
        user: config.postgresql.user,
        password: config.postgresql.password,
        host: config.postgresql.host,
        port: config.postgresql.port,
        database: config.postgresql.database,
      });

      await client.connect();
      logger.info("✅ Conectado a PostgreSQL");

      // Verificar si el esquema existe
      const schemaExistsQuery = `
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `;

      const schemaResult = await client.query(schemaExistsQuery, [schemaName]);

      if (schemaResult.rows.length === 0) {
        logger.warn(`⚠️ El esquema '${schemaName}' no existe`);
        return { dropped: false, reason: "Schema does not exist" };
      }

      // Obtener lista de tablas en el esquema
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        ORDER BY table_name
      `;

      const tablesResult = await client.query(tablesQuery, [schemaName]);
      const tableCount = tablesResult.rows.length;

      if (tableCount > 0) {
        logger.info(
          `📊 Encontradas ${tableCount} tablas en esquema '${schemaName}':`
        );
        tablesResult.rows.forEach((row, index) => {
          logger.info(`   ${index + 1}. ${row.table_name}`);
        });
      }

      // Eliminar esquema con CASCADE para eliminar todas las dependencias
      const dropSchemaQuery = `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`;
      await client.query(dropSchemaQuery);

      logger.info(`✅ Esquema '${schemaName}' eliminado exitosamente`);
      logger.info(`📊 ${tableCount} tablas eliminadas`);

      return {
        dropped: true,
        tablesDropped: tableCount,
        tables: tablesResult.rows.map((row) => row.table_name),
      };
    } catch (error) {
      logger.error(`❌ Error eliminando esquema '${schemaName}':`, error);
      throw error;
    } finally {
      if (client) {
        await client.end();
        logger.info("🔌 Desconectado de PostgreSQL");
      }
    }
  }

  /**
   * Obtener estadísticas del esquema
   */
  static async getSchemaStats(schemaName = "dbo") {
    let client;

    try {
      client = new Client({
        user: config.postgresql.user,
        password: config.postgresql.password,
        host: config.postgresql.host,
        port: config.postgresql.port,
        database: config.postgresql.database,
      });

      await client.connect();

      // Verificar si el esquema existe
      const schemaExistsQuery = `
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `;

      const schemaResult = await client.query(schemaExistsQuery, [schemaName]);

      if (schemaResult.rows.length === 0) {
        return { exists: false, tables: 0, totalRows: 0 };
      }

      // Obtener conteo de tablas
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1
      `;

      const tablesResult = await client.query(tablesQuery, [schemaName]);
      const tables = tablesResult.rows.map((row) => row.table_name);

      // Obtener conteo total de registros
      let totalRows = 0;
      for (const tableName of tables) {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM "${schemaName}"."${tableName}"`;
          const countResult = await client.query(countQuery);
          totalRows += parseInt(countResult.rows[0].count);
        } catch (error) {
          // Continuar si no se puede contar una tabla
          logger.warn(`⚠️ No se pudo contar registros en ${tableName}`);
        }
      }

      return {
        exists: true,
        tables: tables.length,
        tableNames: tables,
        totalRows,
      };
    } catch (error) {
      logger.error(`❌ Error obteniendo estadísticas del esquema:`, error);
      return { exists: false, tables: 0, totalRows: 0 };
    } finally {
      if (client) {
        await client.end();
      }
    }
  }
}
