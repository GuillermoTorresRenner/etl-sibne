import { SqlServerExtractor } from "../extractors/sqlserver-extractor.js";
import { PostgreSQLLoader } from "../loaders/postgres-loader.js";
import { config, validateConfig } from "../config/database.js";
import { logger } from "../utils/logger.js";
import pLimit from "p-limit";
import { ProgressBar } from "../utils/progress.js";

/**
 * Pipeline ETL principal para migración SIBNE
 */
export class ETLPipeline {
  constructor() {
    this.sqlExtractor = new SqlServerExtractor();
    this.pgLoader = new PostgreSQLLoader();
    this.concurrencyLimit = pLimit(config.etl.concurrency);
    this.stats = {
      startTime: null,
      endTime: null,
      tablesProcessed: 0,
      totalRows: 0,
      errors: [],
      success: [],
    };
  }

  /**
   * Inicializar pipeline
   */
  async initialize() {
    try {
      logger.info("🚀 Inicializando ETL Pipeline SIBNE");

      // Validar configuración
      validateConfig();

      // Crear base de datos PostgreSQL si no existe
      await this.pgLoader.createDatabaseIfNotExists();

      // Conectar a ambas bases de datos
      await this.sqlExtractor.connect();
      await this.pgLoader.connect();

      // Crear tabla ArchivoAdjunto con la estructura correcta
      await this.pgLoader.createArchivoAdjuntoTable("dbo");

      logger.info("✅ Pipeline inicializado correctamente");
    } catch (error) {
      logger.error("❌ Error inicializando pipeline:", error);
      throw error;
    }
  }

  /**
   * Obtener lista de tablas a migrar (solo tablas del negocio)
   */
  async getTableList(excludePatterns = []) {
    try {
      const tables = await this.sqlExtractor.getTables();

      // Patrones por defecto para excluir tablas del sistema
      const defaultExcludePatterns = [
        "sys",
        "trace",
        "MSreplication",
        "information_schema",
        "AspNet", // Todas las tablas de ASP.NET Identity
        "__", // Tablas que empiecen con __
      ];

      // Combinar patrones por defecto con los del usuario
      const allExcludePatterns = [
        ...defaultExcludePatterns,
        ...excludePatterns,
      ];

      // Filtrar tablas excluidas
      const filteredTables = tables.filter((table) => {
        const fullName = `${table.TABLE_SCHEMA}.${table.TABLE_NAME}`;
        const tableName = table.TABLE_NAME;

        // Excluir si coincide con algún patrón
        const shouldExclude = allExcludePatterns.some((pattern) => {
          // Verificar nombre completo y solo nombre de tabla
          return (
            fullName.toLowerCase().includes(pattern.toLowerCase()) ||
            tableName.toLowerCase().includes(pattern.toLowerCase()) ||
            tableName.startsWith("AspNet") ||
            tableName.startsWith("__")
          );
        });

        return !shouldExclude;
      });

      logger.info(`📊 Total de tablas encontradas: ${tables.length}`);
      logger.info(`📋 Tablas del negocio a migrar: ${filteredTables.length}`);

      // Mostrar algunas tablas que serán migradas
      if (filteredTables.length > 0) {
        logger.info("🎯 Primeras tablas del negocio:");
        filteredTables.slice(0, 10).forEach((table, index) => {
          logger.info(
            `   ${index + 1}. ${table.TABLE_SCHEMA}.${table.TABLE_NAME}`
          );
        });
        if (filteredTables.length > 10) {
          logger.info(`   ... y ${filteredTables.length - 10} tablas más`);
        }
      }

      return filteredTables;
    } catch (error) {
      logger.error("❌ Error obteniendo lista de tablas:", error);
      throw error;
    }
  }

  /**
   * Migrar una tabla específica
   */
  async migrateTable(tableInfo, mode = "direct") {
    const { TABLE_SCHEMA: schema, TABLE_NAME: tableName } = tableInfo;
    const fullTableName = `${schema}.${tableName}`;

    try {
      logger.info(`🔄 Iniciando migración de tabla: ${fullTableName}`);

      // 1. Obtener información de columnas
      const columns = await this.sqlExtractor.getTableInfo(tableName, schema);

      if (columns.length === 0) {
        logger.warn(`⚠️ No se encontraron columnas para ${fullTableName}`);
        return { success: false, reason: "No columns found" };
      }

      // 2. Crear esquema en PostgreSQL si no existe
      await this.pgLoader.createSchemaIfNotExists(schema);

      // 3. Crear tabla en PostgreSQL
      await this.pgLoader.createTable(tableName, columns, schema);

      let result;

      // 4. Migrar datos SIEMPRE vía CSV (requerimiento del usuario)
      logger.info(`💾 Forzando migración vía CSV para generar respaldo`);
      result = await this._migrateViaCSV(tableName, schema, columns);

      // 5. Verificar integridad
      const pgStats = await this.pgLoader.getTableStats(tableName, schema);
      const sqlCount = await this.sqlExtractor.getTableCount(tableName, schema);

      if (parseInt(pgStats.row_count) === sqlCount) {
        logger.info(
          `✅ ${fullTableName}: Migración exitosa - ${pgStats.row_count} filas`
        );
        return {
          success: true,
          rowsProcessed: parseInt(pgStats.row_count),
          tableSize: pgStats.table_size,
          ...result,
        };
      } else {
        logger.error(
          `❌ ${fullTableName}: Discrepancia en conteo - SQL: ${sqlCount}, PG: ${pgStats.row_count}`
        );
        return {
          success: false,
          reason: "Row count mismatch",
          sqlCount,
          pgCount: parseInt(pgStats.row_count),
        };
      }
    } catch (error) {
      logger.error(`❌ Error migrando tabla ${fullTableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migración directa (sin CSV intermedio)
   */
  async _migrateDirect(tableName, schema, columns) {
    try {
      const { stream } = await this.sqlExtractor.extractTableStream(
        tableName,
        schema
      );
      const result = await this.pgLoader.loadFromStream(
        stream,
        tableName,
        columns,
        schema
      );

      return { mode: "direct", ...result };
    } catch (error) {
      logger.error(
        `❌ Error en migración directa de ${schema}.${tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Migración vía CSV
   */
  async _migrateViaCSV(tableName, schema, columns) {
    try {
      // 1. Extraer a CSV
      const csvResult = await this.sqlExtractor.extractTableToCSV(
        tableName,
        schema
      );

      // 2. Cargar desde CSV
      const loadResult = await this.pgLoader.loadFromCSV(
        csvResult.outputPath,
        tableName,
        columns,
        schema
      );

      return {
        mode: "csv",
        csvPath: csvResult.outputPath,
        ...loadResult,
      };
    } catch (error) {
      logger.error(
        `❌ Error en migración vía CSV de ${schema}.${tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Ejecutar migración completa
   */
  async run(options = {}) {
    this.stats.startTime = new Date();

    try {
      const {
        mode = "csv", // SIEMPRE CSV por requerimiento del usuario
        excludePatterns = [], // Los patrones por defecto ya están en getTableList
        tablesFilter = null, // Array de nombres de tablas específicas
        parallel = true,
      } = options;

      logger.info(
        "🎯 Iniciando migración ETL completa - SOLO TABLAS DEL NEGOCIO",
        {
          mode: "csv (siempre)",
          parallel,
          note: "Filtrando AspNet y __ automáticamente",
        }
      );

      // Inicializar
      await this.initialize();

      // Obtener tablas
      let tables = await this.getTableList(excludePatterns);

      // Filtrar tablas específicas si se proporciona
      if (tablesFilter && Array.isArray(tablesFilter)) {
        tables = tables.filter(
          (t) =>
            tablesFilter.includes(t.TABLE_NAME) ||
            tablesFilter.includes(`${t.TABLE_SCHEMA}.${t.TABLE_NAME}`)
        );
        logger.info(`🎯 Filtrando a ${tables.length} tablas específicas`);
      }

      if (tables.length === 0) {
        logger.warn("⚠️ No hay tablas para migrar");
        return this.stats;
      }

      // Crear barra de progreso
      const progressBar = new ProgressBar(tables.length);

      // Procesar tablas
      if (parallel) {
        await this._processTablesParallel(tables, mode, progressBar);
      } else {
        await this._processTablesSequential(tables, mode, progressBar);
      }

      // Finalizar
      this.stats.endTime = new Date();
      await this._generateReport();

      return this.stats;
    } catch (error) {
      logger.error("❌ Error en migración ETL:", error);
      this.stats.errors.push({ general: error.message });
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Procesar tablas en paralelo
   */
  async _processTablesParallel(tables, mode, progressBar) {
    const promises = tables.map((table) =>
      this.concurrencyLimit(async () => {
        const result = await this.migrateTable(table, mode);
        this._updateStats(table, result);
        progressBar.increment(`${table.TABLE_SCHEMA}.${table.TABLE_NAME}`);
        return result;
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Procesar tablas secuencialmente
   */
  async _processTablesSequential(tables, mode, progressBar) {
    for (const table of tables) {
      const result = await this.migrateTable(table, mode);
      this._updateStats(table, result);
      progressBar.increment(`${table.TABLE_SCHEMA}.${table.TABLE_NAME}`);
    }
  }

  /**
   * Actualizar estadísticas
   */
  _updateStats(table, result) {
    this.stats.tablesProcessed++;

    if (result.success) {
      this.stats.totalRows += result.rowsProcessed || 0;
      this.stats.success.push({
        table: `${table.TABLE_SCHEMA}.${table.TABLE_NAME}`,
        rows: result.rowsProcessed,
        size: result.tableSize,
        mode: result.mode,
      });
    } else {
      this.stats.errors.push({
        table: `${table.TABLE_SCHEMA}.${table.TABLE_NAME}`,
        error: result.error || result.reason,
        details: result,
      });
    }
  }

  /**
   * Generar reporte final
   */
  async _generateReport() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationMinutes = Math.round((duration / 1000 / 60) * 100) / 100;

    logger.info("📊 REPORTE FINAL DE MIGRACIÓN ETL");
    logger.info("=====================================");
    logger.info(`⏱️  Duración: ${durationMinutes} minutos`);
    logger.info(`📋 Tablas procesadas: ${this.stats.tablesProcessed}`);
    logger.info(`✅ Éxitos: ${this.stats.success.length}`);
    logger.info(`❌ Errores: ${this.stats.errors.length}`);
    logger.info(
      `📊 Total filas migradas: ${this.stats.totalRows.toLocaleString()}`
    );

    if (this.stats.errors.length > 0) {
      logger.info("\n❌ ERRORES ENCONTRADOS:");
      this.stats.errors.forEach((error) => {
        logger.error(`   • ${error.table}: ${error.error}`);
      });
    }

    if (this.stats.success.length > 0) {
      logger.info("\n✅ TABLAS MIGRADAS EXITOSAMENTE:");
      this.stats.success
        .sort((a, b) => b.rows - a.rows)
        .slice(0, 10)
        .forEach((success) => {
          logger.info(
            `   • ${success.table}: ${success.rows.toLocaleString()} filas (${
              success.size
            })`
          );
        });

      if (this.stats.success.length > 10) {
        logger.info(`   ... y ${this.stats.success.length - 10} tablas más`);
      }
    }
  }

  /**
   * Limpiar recursos
   */
  async cleanup() {
    try {
      await this.sqlExtractor.disconnect();
      await this.pgLoader.disconnect();
      logger.info("🧹 Recursos liberados");
    } catch (error) {
      logger.error("❌ Error liberando recursos:", error);
    }
  }
}

export default ETLPipeline;
