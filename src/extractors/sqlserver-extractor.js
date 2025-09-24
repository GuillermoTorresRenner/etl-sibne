import sql from "mssql";
import { config } from "../config/database.js";
import { logger } from "../utils/logger.js";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { format } from "fast-csv";

/**
 * Extractor de datos de SQL Server
 */
export class SqlServerExtractor {
  constructor() {
    this.pool = null;
    this.isConnected = false;

    // Columnas binarias problemáticas a saltar temporalmente
    this.BINARY_COLUMNS_TO_SKIP = ["FileData", "BinaryData", "Image"];
  }

  /**
   * Conectar a SQL Server
   */
  async connect() {
    try {
      if (this.isConnected) return this.pool;

      logger.info("Conectando a SQL Server...", {
        server: config.sqlServer.server,
        database: config.sqlServer.database,
        port: config.sqlServer.port,
      });

      this.pool = await sql.connect(config.sqlServer);
      this.isConnected = true;

      logger.info("✅ Conectado exitosamente a SQL Server");
      return this.pool;
    } catch (error) {
      logger.error("❌ Error conectando a SQL Server:", error);
      throw error;
    }
  }

  /**
   * Obtener lista de todas las tablas
   */
  async getTables() {
    try {
      await this.connect();

      const query = `
        SELECT 
          TABLE_SCHEMA,
          TABLE_NAME,
          TABLE_TYPE
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_SCHEMA, TABLE_NAME
      `;

      const result = await this.pool.request().query(query);
      logger.info(
        `📊 Encontradas ${result.recordset.length} tablas en SQL Server`
      );

      return result.recordset;
    } catch (error) {
      logger.error("❌ Error obteniendo lista de tablas:", error);
      throw error;
    }
  }

  /**
   * Obtener información detallada de una tabla
   */
  async getTableInfo(tableName, schema = "dbo") {
    try {
      await this.connect();

      const query = `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tableName 
        AND TABLE_SCHEMA = @schema
        ORDER BY ORDINAL_POSITION
      `;

      const request = this.pool.request();
      request.input("tableName", sql.VarChar, tableName);
      request.input("schema", sql.VarChar, schema);

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      logger.error(
        `❌ Error obteniendo info de tabla ${schema}.${tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Contar registros de una tabla
   */
  async getTableCount(tableName, schema = "dbo") {
    try {
      await this.connect();

      const query = `SELECT COUNT(*) as total FROM [${schema}].[${tableName}]`;
      const result = await this.pool.request().query(query);

      return result.recordset[0].total;
    } catch (error) {
      logger.error(
        `❌ Error contando registros de ${schema}.${tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener columnas no binarias de una tabla
   */
  async getNonBinaryColumns(tableName, schema = "dbo") {
    const columnsResult = await this.pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${schema}' 
      AND TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION
    `);

    return columnsResult.recordset.filter((col) => {
      const isBinary =
        this.BINARY_COLUMNS_TO_SKIP.some((skipCol) =>
          col.COLUMN_NAME.toLowerCase().includes(skipCol.toLowerCase())
        ) ||
        ["binary", "varbinary", "image"].includes(col.DATA_TYPE.toLowerCase());

      if (isBinary) {
        logger.warn(
          `⚠️ Saltando columna binaria en extracción: ${col.COLUMN_NAME} (${col.DATA_TYPE})`
        );
        return false;
      }
      return true;
    });
  }

  /**
   * Extraer datos de una tabla (stream)
   */
  async extractTableStream(tableName, schema = "dbo") {
    try {
      await this.connect();

      // Obtener columnas no binarias
      const nonBinaryColumns = await this.getNonBinaryColumns(
        tableName,
        schema
      );
      const columnNames = nonBinaryColumns
        .map((col) => `[${col.COLUMN_NAME}]`)
        .join(", ");

      // Obtener count total para progress
      const countResult = await this.pool
        .request()
        .query(`SELECT COUNT(*) as total FROM [${schema}].[${tableName}]`);
      const totalRows = countResult.recordset[0].total;

      logger.info(
        `📤 Extrayendo ${totalRows} registros de ${schema}.${tableName} (sin columnas binarias)`
      );

      const request = this.pool.request();
      request.stream = true;

      const query = `SELECT ${columnNames} FROM [${schema}].[${tableName}]`;

      // En el contexto de streaming, devolvemos el request directamente
      return {
        stream: request,
        totalRows,
        tableName,
        schema,
        query,
      };
    } catch (error) {
      logger.error(
        `❌ Error extrayendo datos de ${schema}.${tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Extraer tabla completa a CSV
   */
  async extractTableToCSV(tableName, schema = "dbo") {
    try {
      const outputPath = `${config.paths.csvOutput}/${schema}_${tableName}.csv`;
      const writeStream = createWriteStream(outputPath);
      const csvStream = format({ headers: true });

      csvStream.pipe(writeStream);

      const { stream, totalRows, query } = await this.extractTableStream(
        tableName,
        schema
      );
      let processedRows = 0;

      logger.info(`💾 Exportando ${schema}.${tableName} a CSV: ${outputPath}`);

      return new Promise((resolve, reject) => {
        // Configurar eventos del request stream
        stream.on("recordset", (columns) => {
          // Los headers se manejan automáticamente con { headers: true }
        });

        stream.on("row", (row) => {
          csvStream.write(row);
          processedRows++;

          if (processedRows % 1000 === 0) {
            logger.info(
              `📊 ${schema}.${tableName}: ${processedRows}/${totalRows} filas procesadas`
            );
          }
        });

        stream.on("done", () => {
          csvStream.end();
          logger.info(
            `✅ ${schema}.${tableName}: ${processedRows} filas exportadas a CSV`
          );
          resolve({
            tableName,
            schema,
            outputPath,
            processedRows,
            totalRows,
          });
        });

        stream.on("error", (error) => {
          logger.error(`❌ Error en stream de ${schema}.${tableName}:`, error);
          reject(error);
        });

        csvStream.on("error", (error) => {
          logger.error(`❌ Error escribiendo CSV ${outputPath}:`, error);
          reject(error);
        });

        writeStream.on("error", (error) => {
          logger.error(`❌ Error en archivo ${outputPath}:`, error);
          reject(error);
        });

        // Ejecutar la query una vez configurados todos los eventos
        stream.query(query);
      });
    } catch (error) {
      logger.error(`❌ Error exportando ${schema}.${tableName} a CSV:`, error);
      throw error;
    }
  }

  /**
   * Cerrar conexión
   */
  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.isConnected = false;
        logger.info("🔌 Desconectado de SQL Server");
      }
    } catch (error) {
      logger.error("❌ Error desconectando de SQL Server:", error);
    }
  }
}

export default SqlServerExtractor;
