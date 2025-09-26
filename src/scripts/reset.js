import { DirectoryManager } from "../utils/directory-manager.js";
import { DatabaseManager } from "../utils/database-manager.js";
import { logger } from "../utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de reset completo del proyecto ETL SIBNE
 * Limpia directorios y elimina esquema de base de datos
 */
class ResetScript {
  constructor() {
    this.projectRoot = path.resolve(__dirname, "../../");
    this.directoriesToClean = ["logs", "Archivos", "Tablas", "Reportes"];
  }

  /**
   * Ejecutar reset completo
   */
  async run() {
    try {
    logger.info("🚀 Iniciando reset completo del proyecto ETL SIBNE");
    logger.info("=".repeat(60));      // 1. Limpiar directorios
      await this.cleanDirectories();

      // 2. Eliminar esquema de base de datos
      await this.resetDatabase();

      // 3. Mostrar resumen final
      this.showSummary();

      logger.info("🎉 Reset completado exitosamente");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Error durante el reset:", error);
      process.exit(1);
    }
  }

  /**
   * Limpiar directorios del proyecto
   */
  async cleanDirectories() {
    logger.info("🧹 Limpiando directorios del proyecto...");

    const results = [];

    for (const dirName of this.directoriesToClean) {
      const dirPath = path.join(this.projectRoot, dirName);

      try {
        // Obtener estadísticas antes de limpiar
        const statsBefore = await DirectoryManager.getDirectoryStats(dirPath);

        if (statsBefore.files === 0) {
          logger.info(`📁 ${dirName}: Ya está vacío`);
          results.push({
            directory: dirName,
            filesBefore: 0,
            sizeBefore: "0 B",
            filesRemoved: 0,
            sizeFreed: "0 B",
          });
          continue;
        }

        logger.info(
          `📁 ${dirName}: ${
            statsBefore.files
          } archivos (${DirectoryManager.formatBytes(statsBefore.totalSize)})`
        );

        // Limpiar directorio
        const cleanResult = await DirectoryManager.cleanDirectory(dirPath);

        logger.info(`   ✅ Eliminados: ${cleanResult.filesRemoved} archivos`);
        logger.info(
          `   💾 Espacio liberado: ${DirectoryManager.formatBytes(
            cleanResult.totalSizeRemoved
          )}`
        );

        results.push({
          directory: dirName,
          filesBefore: statsBefore.files,
          sizeBefore: DirectoryManager.formatBytes(statsBefore.totalSize),
          filesRemoved: cleanResult.filesRemoved,
          sizeFreed: DirectoryManager.formatBytes(cleanResult.totalSizeRemoved),
        });
      } catch (error) {
        logger.error(
          `❌ Error limpiando directorio ${dirName}:`,
          error.message
        );
        results.push({
          directory: dirName,
          error: error.message,
        });
      }
    }

    this.cleanResults = results;
    logger.info("✅ Limpieza de directorios completada");
  }

  /**
   * Reset de base de datos (eliminar esquema)
   */
  async resetDatabase() {
    logger.info("🗄️ Reseteando base de datos...");

    try {
      // Obtener estadísticas antes de eliminar
      const statsBefore = await DatabaseManager.getSchemaStats("dbo");

      if (!statsBefore.exists) {
        logger.info("📊 Esquema 'dbo': No existe");
        this.dbResult = {
          existed: false,
          tablesDropped: 0,
          message: "Schema did not exist",
        };
        return;
      }

      logger.info(
        `📊 Esquema 'dbo': ${
          statsBefore.tables
        } tablas, ${statsBefore.totalRows.toLocaleString()} registros`
      );

      // Eliminar esquema
      const dropResult = await DatabaseManager.dropSchema("dbo");

      this.dbResult = {
        existed: true,
        tablesBefore: statsBefore.tables,
        rowsBefore: statsBefore.totalRows,
        tablesDropped: dropResult.tablesDropped,
        tables: dropResult.tables || [],
      };

      logger.info("✅ Reset de base de datos completado");
    } catch (error) {
      logger.error("❌ Error en reset de base de datos:", error.message);
      this.dbResult = {
        error: error.message,
      };
    }
  }

  /**
   * Mostrar resumen final
   */
  showSummary() {
    logger.info("");
    logger.info("📋 RESUMEN DEL RESET");
    logger.info("=".repeat(40));

    // Resumen de directorios
    logger.info("🗂️ Directorios limpiados:");
    let totalFilesRemoved = 0;
    let totalSizeFreed = 0;

    this.cleanResults.forEach((result) => {
      if (result.error) {
        logger.info(`   ❌ ${result.directory}: Error - ${result.error}`);
      } else {
        logger.info(
          `   ✅ ${result.directory}: ${result.filesRemoved || 0} archivos eliminados`
        );
        totalFilesRemoved += result.filesRemoved || 0;
      }
    });

    logger.info(`   📊 Total: ${totalFilesRemoved} archivos eliminados`);

    // Resumen de base de datos
    logger.info("");
    logger.info("🗄️ Base de datos:");
    if (this.dbResult.error) {
      logger.info(`   ❌ Error: ${this.dbResult.error}`);
    } else if (!this.dbResult.existed) {
      logger.info("   ✅ Esquema 'dbo' no existía");
    } else {
      logger.info(
        `   ✅ Esquema 'dbo' eliminado: ${this.dbResult.tablesDropped} tablas`
      );
      logger.info(
        `   📊 Registros eliminados: ${
          this.dbResult.rowsBefore?.toLocaleString() || 0
        }`
      );
    }

    logger.info("");
    logger.info("🎯 El proyecto está listo para una nueva migración");
  }
}

// Ejecutar script si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const resetScript = new ResetScript();
  resetScript.run();
}

export { ResetScript };
