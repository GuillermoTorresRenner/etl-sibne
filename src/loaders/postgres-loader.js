import pg from "pg";
const { Pool } = pg;
import { config } from "../config/database.js";
import { logger } from "../utils/logger.js";
import { createReadStream } from "node:fs";
import { parse } from "fast-csv";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";

/**
 * Loader de datos para PostgreSQL
 */
export class PostgreSQLLoader {
  constructor() {
    this.pool = null;
    this.isConnected = false;

    // Columnas binarias problemáticas a saltar temporalmente
    this.BINARY_COLUMNS_TO_SKIP = ["FileData", "BinaryData", "Image"];
  }

  /**
   * Conectar a PostgreSQL
   */
  async connect() {
    try {
      if (this.isConnected) return this.pool;

      logger.info("Conectando a PostgreSQL...", {
        host: config.postgresql.host,
        database: config.postgresql.database,
        port: config.postgresql.port,
      });

      this.pool = new Pool(config.postgresql);

      // Probar conexión
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      this.isConnected = true;
      logger.info("✅ Conectado exitosamente a PostgreSQL");
      return this.pool;
    } catch (error) {
      logger.error("❌ Error conectando a PostgreSQL:", error);
      throw error;
    }
  }

  /**
   * Crear base de datos si no existe
   */
  async createDatabaseIfNotExists() {
    try {
      const tempConfig = { ...config.postgresql, database: "postgres" };
      const tempPool = new Pool(tempConfig);

      const client = await tempPool.connect();

      // Verificar si la base de datos existe
      const checkDb = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [config.postgresql.database]
      );

      if (checkDb.rows.length === 0) {
        logger.info(`🗄️ Creando base de datos: ${config.postgresql.database}`);
        await client.query(`CREATE DATABASE "${config.postgresql.database}"`);
        logger.info(`✅ Base de datos creada: ${config.postgresql.database}`);
      } else {
        logger.info(
          `✅ Base de datos ya existe: ${config.postgresql.database}`
        );
      }

      client.release();
      await tempPool.end();
    } catch (error) {
      logger.error("❌ Error creando base de datos:", error);
      throw error;
    }
  }

  /**
   * Mapear tipos de SQL Server a PostgreSQL
   */
  mapDataType(sqlServerType, maxLength, precision, scale) {
    const typeMapping = {
      int: "INTEGER",
      bigint: "BIGINT",
      smallint: "SMALLINT",
      tinyint: "SMALLINT",
      bit: "BOOLEAN",
      decimal: `DECIMAL(${precision || 18},${scale || 0})`,
      numeric: `NUMERIC(${precision || 18},${scale || 0})`,
      money: "DECIMAL(19,4)",
      smallmoney: "DECIMAL(10,4)",
      float: "DOUBLE PRECISION",
      real: "REAL",
      datetime: "TIMESTAMP",
      datetime2: "TIMESTAMP",
      smalldatetime: "TIMESTAMP",
      date: "DATE",
      time: "TIME",
      char: `CHAR(${maxLength || 1})`,
      varchar: maxLength > 0 ? `VARCHAR(${maxLength})` : "TEXT",
      nchar: `CHAR(${maxLength || 1})`,
      nvarchar: maxLength > 0 ? `VARCHAR(${maxLength})` : "TEXT",
      text: "TEXT",
      ntext: "TEXT",
      binary: `BYTEA`,
      varbinary: `BYTEA`,
      image: "BYTEA",
      uniqueidentifier: "UUID",
    };

    return typeMapping[sqlServerType.toLowerCase()] || "TEXT";
  }

  /**
   * Crear tabla en PostgreSQL basada en estructura de SQL Server
   */
  async createTable(tableName, columns, schema = "public") {
    try {
      await this.connect();

      // Filtrar columnas binarias problemáticas
      const filteredColumns = columns.filter((col) => {
        const isBinary =
          this.BINARY_COLUMNS_TO_SKIP.some((skipCol) =>
            col.COLUMN_NAME.toLowerCase().includes(skipCol.toLowerCase())
          ) ||
          ["binary", "varbinary", "image"].includes(
            col.DATA_TYPE.toLowerCase()
          );

        if (isBinary) {
          logger.warn(
            `⚠️ Saltando columna binaria: ${col.COLUMN_NAME} (${col.DATA_TYPE})`
          );
          return false;
        }
        return true;
      });

      const columnDefinitions = filteredColumns.map((col) => {
        const pgType = this.mapDataType(
          col.DATA_TYPE,
          col.CHARACTER_MAXIMUM_LENGTH,
          col.NUMERIC_PRECISION,
          col.NUMERIC_SCALE
        );

        const nullable = col.IS_NULLABLE === "YES" ? "" : " NOT NULL";
        return `"${col.COLUMN_NAME}" ${pgType}${nullable}`;
      });

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "${schema}"."${tableName}" (
          ${columnDefinitions.join(",\n          ")}
        )
      `;

      // Crear esquema antes de crear la tabla
      await this.createSchemaIfNotExists(schema);

      logger.info(`🏗️ Creando tabla: ${schema}.${tableName}`);
      await this.pool.query(createTableSQL);
      logger.info(`✅ Tabla creada: ${schema}.${tableName}`);

      return createTableSQL;
    } catch (error) {
      logger.error(`❌ Error creando tabla ${schema}.${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Cargar datos desde CSV usando COPY (version simplificada)
   */
  async loadFromCSV(csvPath, tableName, columns, schema = "public") {
    let client;
    try {
      await this.connect();
      client = await this.pool.connect();

      logger.info(
        `📥 Cargando datos desde CSV: ${csvPath} → ${schema}.${tableName}`
      );

      // Truncar tabla antes de cargar
      await client.query(`TRUNCATE TABLE "${schema}"."${tableName}"`);

      // Leer archivo CSV y procesar línea por línea
      const csvData = [];

      return new Promise((resolve, reject) => {
        const fileStream = createReadStream(csvPath, { encoding: "utf8" });

        fileStream
          .pipe(parse({ headers: true, skipEmptyLines: true }))
          .on("data", (row) => {
            csvData.push(row);
          })
          .on("end", async () => {
            try {
              if (csvData.length === 0) {
                logger.info(
                  `⚠️ No hay datos para cargar en ${schema}.${tableName}`
                );
                client.release();
                return resolve({ rowCount: 0, tableName, schema });
              }

              // Filtrar columnas binarias también en la carga
              const filteredColumns = columns.filter((col) => {
                const isBinary =
                  this.BINARY_COLUMNS_TO_SKIP.some((skipCol) =>
                    col.COLUMN_NAME.toLowerCase().includes(
                      skipCol.toLowerCase()
                    )
                  ) ||
                  ["binary", "varbinary", "image"].includes(
                    col.DATA_TYPE.toLowerCase()
                  );
                return !isBinary;
              });

              // Preparar INSERT batch
              const columnNames = filteredColumns.map((col) => col.COLUMN_NAME);
              const placeholders = columnNames
                .map((_, i) => `$${i + 1}`)
                .join(", ");
              const insertQuery = `
                INSERT INTO "${schema}"."${tableName}" (${columnNames
                .map((c) => `"${c}"`)
                .join(", ")})
                VALUES (${placeholders})
              `;

              logger.info(`� Insertando ${csvData.length} filas...`);

              // Procesar en lotes para eficiencia
              const batchSize = 100;
              let totalInserted = 0;

              for (let i = 0; i < csvData.length; i += batchSize) {
                const batch = csvData.slice(i, i + batchSize);

                for (const row of batch) {
                  const values = columnNames.map((col) => {
                    let value = row[col] || null;

                    // Saltar valores de columnas binarias que puedan haber quedado
                    if (
                      this.BINARY_COLUMNS_TO_SKIP.some((skipCol) =>
                        col.toLowerCase().includes(skipCol.toLowerCase())
                      )
                    ) {
                      return null; // O simplemente omitir
                    }

                    // Si el valor parece una fecha con timezone, transformarla
                    if (value && typeof value === "string") {
                      // Detectar varios formatos de fecha problemáticos
                      const datePatterns = [
                        /GMT-0[34]00.*\(hora.*Chile\)/i, // GMT-0400 (hora estándar de Chile)
                        /gmt-0[34]00/i, // gmt-0300, gmt-0400
                        /[A-Z]{3}\s+[A-Z]{3}\s+\d+\s+\d+/, // Wed May 17 2017...
                      ];

                      const hasDatePattern = datePatterns.some((pattern) =>
                        pattern.test(value)
                      );

                      if (hasDatePattern) {
                        try {
                          // Limpiar el string de fecha para parsing
                          let cleanDate = value
                            .replace(/\s+\([^)]+\)$/, "") // Remover (hora estándar de Chile)
                            .replace(/gmt-0([34])00/gi, "GMT-0$1:00"); // Normalizar GMT-0300 -> GMT-03:00

                          const date = new Date(cleanDate);
                          if (!isNaN(date.getTime())) {
                            value = date.toISOString();
                          } else {
                            // Si falla, intentar parsearlo como fecha sin timezone
                            const simpleDate = cleanDate.replace(
                              /\s+GMT.*$/,
                              ""
                            );
                            const fallbackDate = new Date(simpleDate);
                            if (!isNaN(fallbackDate.getTime())) {
                              value = fallbackDate.toISOString();
                            } else {
                              logger.warn(
                                `⚠️ No se pudo parsear fecha: ${value} -> ${cleanDate}`
                              );
                            }
                          }
                        } catch (dateError) {
                          logger.warn(
                            `⚠️ Error parseando fecha: ${value}`,
                            dateError.message
                          );
                        }
                      }
                    }

                    return value;
                  });
                  await client.query(insertQuery, values);
                  totalInserted++;
                }
                if (totalInserted % 500 === 0) {
                  logger.info(
                    `📊 Procesadas ${totalInserted}/${csvData.length} filas...`
                  );
                }
              }

              client.release();
              logger.info(
                `✅ ${schema}.${tableName}: ${totalInserted} filas cargadas desde CSV`
              );
              resolve({ rowCount: totalInserted, tableName, schema });
            } catch (insertError) {
              client.release();
              reject(insertError);
            }
          })
          .on("error", (error) => {
            client.release();
            reject(error);
          });
      });
    } catch (error) {
      if (client) client.release();
      logger.error(`❌ Error cargando CSV en ${schema}.${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Cargar datos siempre vía CSV (requerimiento del usuario)
   */
  async loadFromStream(dataStream, tableName, columns, schema = "public") {
    // Redirigir a método CSV para siempre generar respaldo
    logger.info(`� Redirigiendo a carga vía CSV para generar respaldo`);

    // Nota: Este método será manejado por el pipeline ETL que primero
    // exporta a CSV y luego carga desde el CSV
    throw new Error(
      "Este método debe ser manejado por el pipeline ETL con CSV intermedio"
    );
  }

  /**
   * Ejecutar batch de inserts
   */
  async _executeBatch(client, query, batchData) {
    for (const values of batchData) {
      await client.query(query, values);
    }
  }

  /**
   * Obtener estadísticas de tabla
   */
  async getTableStats(tableName, schema = "public") {
    try {
      await this.connect();

      const query = `
        SELECT 
          COUNT(*) as row_count,
          pg_size_pretty(pg_total_relation_size('"${schema}"."${tableName}"')) as table_size
        FROM "${schema}"."${tableName}"
      `;

      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error(
        `❌ Error obteniendo estadísticas de ${schema}.${tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crear esquema si no existe
   */
  async createSchemaIfNotExists(schema = "public") {
    try {
      if (schema === "public") return; // public ya existe

      await this.connect();

      // Verificar si el esquema ya existe
      const checkQuery = `
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `;

      const result = await this.pool.query(checkQuery, [schema]);

      if (result.rows.length === 0) {
        await this.pool.query(`CREATE SCHEMA "${schema}"`);
        logger.info(`✅ Esquema creado: ${schema}`);
      } else {
        logger.info(`✅ Esquema ya existe: ${schema}`);
      }
    } catch (error) {
      logger.error(`❌ Error creando esquema ${schema}:`, error);
      throw error;
    }
  }

  /**
   * Crear tabla ArchivoAdjunto con la estructura correcta y clave primaria
   */
  async createArchivoAdjuntoTable(schema = "dbo") {
    try {
      await this.connect();
      await this.createSchemaIfNotExists(schema);

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "${schema}"."ArchivoAdjunto" (
          "Id" INTEGER NOT NULL,
          "NombreArchivo" TEXT,
          "Tipo" TEXT,
          "Ext" TEXT,
          "FileName" VARCHAR(255),
          CONSTRAINT "ArchivoAdjunto_pkey" PRIMARY KEY ("Id")
        )
      `;

      logger.info(`🏗️ Creando tabla ArchivoAdjunto con estructura completa...`);
      await this.pool.query(createTableSQL);
      logger.info(`✅ Tabla ArchivoAdjunto creada con clave primaria`);

      return createTableSQL;
    } catch (error) {
      logger.error(`❌ Error creando tabla ArchivoAdjunto:`, error);
      throw error;
    }
  }

  /**
   * Cerrar conexión
   */
  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.isConnected = false;
        logger.info("🔌 Desconectado de PostgreSQL");
      }
    } catch (error) {
      logger.error("❌ Error desconectando de PostgreSQL:", error);
    }
  }
}

/**
 * Función helper para COPY FROM
 */
function copyFrom(txt) {
  return {
    name: "copy-from",
    text: txt,
  };
}

export default PostgreSQLLoader;
