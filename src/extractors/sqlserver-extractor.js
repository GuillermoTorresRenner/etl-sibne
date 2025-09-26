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

      // Usar CAST para convertir campos que puedan tener caracteres especiales
      const castColumns = nonBinaryColumns
        .map((col) => {
          // Convertir campos de texto a NVARCHAR para mejor manejo de caracteres especiales
          if (['varchar', 'char', 'nvarchar', 'nchar', 'text', 'ntext'].includes(col.DATA_TYPE.toLowerCase())) {
            return `CAST([${col.COLUMN_NAME}] AS NVARCHAR(MAX)) AS [${col.COLUMN_NAME}]`;
          }
          return `[${col.COLUMN_NAME}]`;
        })
        .join(", ");

      const query = `SELECT ${castColumns} FROM [${schema}].[${tableName}] ORDER BY Id`;

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
      const writeStream = createWriteStream(outputPath, { encoding: 'utf8' });
      const csvStream = format({ 
        headers: true,
        quote: '"',
        escape: '"',
        delimiter: ',',
        alwaysWriteHeaders: true,
        quoteColumns: true, // Forzar comillas en todas las columnas
        transform: (row) => {
          // Limpiar y escapar caracteres especiales en cada campo
          const cleanedRow = {};
          Object.keys(row).forEach(key => {
            if (row[key] !== null && row[key] !== undefined) {
              let value = String(row[key]);
              
              // Para EmailLogs, aplicar limpieza intensiva de saltos de línea
              if (tableName === 'EmailLogs') {
                value = value
                  .replace(/\r\n/g, '\\n')  // Escapar saltos de línea Windows
                  .replace(/\n/g, '\\n')    // Escapar saltos de línea Unix
                  .replace(/\r/g, '\\n')    // Escapar retornos de carro Mac
                  .replace(/"/g, '""')      // Escapar comillas dobles
                  .replace(/\t/g, ' ')      // Reemplazar tabs con espacios
                  .trim();
              } else {
                // Para otras tablas, reemplazar con espacios como antes
                value = value
                  .replace(/"/g, '""')      // Escapar comillas dobles
                  .replace(/\r\n/g, ' ')    // Reemplazar saltos de línea
                  .replace(/\n/g, ' ')      // Reemplazar saltos de línea
                  .replace(/\r/g, ' ')      // Reemplazar retornos de carro
                  .replace(/\t/g, ' ')      // Reemplazar tabs
                  .trim();
              }
              
              cleanedRow[key] = value;
            } else {
              cleanedRow[key] = row[key];
            }
          });
          return cleanedRow;
        }
      });

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
          try {
            csvStream.write(row);
            processedRows++;

            if (processedRows % 1000 === 0) {
              logger.info(
                `📊 ${schema}.${tableName}: ${processedRows}/${totalRows} filas procesadas`
              );
            }
          } catch (rowError) {
            logger.warn(`⚠️ Error procesando fila ${processedRows + 1} en ${schema}.${tableName}:`, rowError);
            // Continuar con la siguiente fila en lugar de fallar completamente
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
   * Obtener conteo de filas de una tabla
   */
  async getRowCount(tableName) {
    try {
      await this.connect();
      const result = await this.pool.request()
        .query(`SELECT COUNT(*) as count FROM dbo.[${tableName}]`);
      return result.recordset[0].count;
    } catch (error) {
      logger.error(`❌ Error contando filas en ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener esquema de una tabla
   */
  async getTableSchema(tableName) {
    try {
      await this.connect();
      const result = await this.pool.request()
        .input('tableName', sql.VarChar, tableName)
        .query(`
          SELECT 
            c.COLUMN_NAME as name,
            c.DATA_TYPE as type,
            c.IS_NULLABLE as nullable,
            c.CHARACTER_MAXIMUM_LENGTH as maxLength,
            CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as isPrimaryKey
          FROM INFORMATION_SCHEMA.COLUMNS c
          LEFT JOIN (
            SELECT ku.TABLE_NAME, ku.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
              ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
              AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
          ) pk ON c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
          WHERE c.TABLE_NAME = @tableName
          ORDER BY c.ORDINAL_POSITION
        `);
      return result.recordset;
    } catch (error) {
      logger.error(`❌ Error obteniendo esquema de ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener muestra de datos
   */
  async getSampleData(tableName, limit = 10) {
    try {
      await this.connect();
      const result = await this.pool.request()
        .query(`SELECT TOP ${limit} * FROM dbo.[${tableName}]`);
      return result.recordset;
    } catch (error) {
      logger.error(`❌ Error obteniendo muestra de ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Verificar valores NULL en columnas
   */
  async checkNullValues(tableName) {
    try {
      await this.connect();
      const schema = await this.getTableSchema(tableName);
      const nullChecks = [];
      
      for (const column of schema) {
        const result = await this.pool.request()
          .query(`SELECT COUNT(*) as nullCount FROM dbo.[${tableName}] WHERE [${column.name}] IS NULL`);
        
        if (result.recordset[0].nullCount > 0) {
          nullChecks.push({
            column: column.name,
            nullCount: result.recordset[0].nullCount
          });
        }
      }
      
      return nullChecks;
    } catch (error) {
      logger.error(`❌ Error verificando valores NULL en ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Verificar registros duplicados
   */
  async checkDuplicates(tableName, columnName) {
    try {
      await this.connect();
      const result = await this.pool.request()
        .query(`
          SELECT COUNT(*) as duplicates
          FROM (
            SELECT [${columnName}], COUNT(*) as cnt
            FROM dbo.[${tableName}]
            GROUP BY [${columnName}]
            HAVING COUNT(*) > 1
          ) duplicated
        `);
      return result.recordset[0].duplicates;
    } catch (error) {
      logger.error(`❌ Error verificando duplicados en ${tableName}.${columnName}:`, error);
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
