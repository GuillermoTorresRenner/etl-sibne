import fs from "fs/promises";
import path from "path";
import { logger } from "./logger.js";

/**
 * Utilidades para manejo de directorios y archivos
 */
export class DirectoryManager {
  /**
   * Limpiar contenido de un directorio preservando .gitkeep
   */
  static async cleanDirectory(dirPath, preserveGitkeep = true) {
    try {
      const absolutePath = path.resolve(dirPath);
      logger.info(`🧹 Limpiando directorio: ${absolutePath}`);

      // Verificar si el directorio existe
      try {
        await fs.access(absolutePath);
      } catch (error) {
        logger.warn(`⚠️ Directorio no existe: ${absolutePath}`);
        return { cleaned: 0, preserved: 0 };
      }

      const entries = await fs.readdir(absolutePath, { withFileTypes: true });
      let cleanedCount = 0;
      let preservedCount = 0;

      for (const entry of entries) {
        const entryPath = path.join(absolutePath, entry.name);

        // Preservar .gitkeep si está habilitado
        if (preserveGitkeep && entry.name === ".gitkeep") {
          logger.info(`✅ Preservando: ${entry.name}`);
          preservedCount++;
          continue;
        }

        try {
          if (entry.isDirectory()) {
            await fs.rm(entryPath, { recursive: true, force: true });
            logger.info(`🗂️ Directorio eliminado: ${entry.name}`);
          } else {
            await fs.unlink(entryPath);
            logger.info(`📄 Archivo eliminado: ${entry.name}`);
          }
          cleanedCount++;
        } catch (error) {
          logger.error(`❌ Error eliminando ${entry.name}:`, error.message);
        }
      }

      logger.info(
        `✅ Directorio limpiado: ${cleanedCount} elementos eliminados, ${preservedCount} preservados`
      );
      return { 
        cleaned: cleanedCount, 
        preserved: preservedCount,
        filesRemoved: cleanedCount,
        totalSizeRemoved: 0 // Por ahora no calculamos el tamaño eliminado
      };
    } catch (error) {
      logger.error(`❌ Error limpiando directorio ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Crear directorio si no existe
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      logger.info(`📁 Directorio asegurado: ${path.resolve(dirPath)}`);
    } catch (error) {
      logger.error(`❌ Error creando directorio ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de un directorio
   */
  static async getDirectoryStats(dirPath) {
    try {
      const absolutePath = path.resolve(dirPath);
      const entries = await fs.readdir(absolutePath, { withFileTypes: true });

      const stats = {
        total: entries.length,
        files: 0,
        directories: 0,
        size: 0,
      };

      for (const entry of entries) {
        if (entry.isDirectory()) {
          stats.directories++;
        } else {
          stats.files++;
          try {
            const filePath = path.join(absolutePath, entry.name);
            const fileStat = await fs.stat(filePath);
            stats.size += fileStat.size;
          } catch (error) {
            // Continuar si no se puede obtener el tamaño
          }
        }
      }

      return {
        ...stats,
        totalSize: stats.size
      };
    } catch (error) {
      return { total: 0, files: 0, directories: 0, size: 0, totalSize: 0 };
    }
  }

  /**
   * Formatear tamaño de bytes a formato legible
   */
  static formatBytes(bytes) {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
