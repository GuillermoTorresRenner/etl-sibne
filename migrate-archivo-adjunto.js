import fs from "fs/promises";
import path from "path";
import pkg from "pg";
import sql from "mssql";
import "dotenv/config";
import MigrationReportGenerator from "./generate-migration-report.js";

const { Client } = pkg;

// Configuraciones
const sqlServerConfig = {
  server: "localhost",
  port: 1433,
  database: "SIBNE_ETL",
  user: "sa",
  password: "4Emperador*",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const postgresConfig = {
  host: "localhost",
  port: 5432,
  database: "sibne",
  user: "sibne",
  password: "D3vel0p3rM0deP4SS",
};

/**
 * Migra metadatos de ArchivoAdjunto usando archivos previamente extraídos
 */
class ArchivoAdjuntoMigrator {
  constructor() {
    this.extractedFilesReport = null;
  }

  /**
   * Carga el reporte de archivos extraídos
   */
  async loadExtractedFilesReport() {
    try {
      const reportPath = path.join(
        process.cwd(),
        "extracted-files-report.json"
      );
      const reportData = await fs.readFile(reportPath, "utf8");
      this.extractedFilesReport = JSON.parse(reportData);
      console.log(
        `✅ Cargado reporte de ${this.extractedFilesReport.length} archivos extraídos`
      );
    } catch (error) {
      console.error("❌ Error cargando reporte de archivos extraídos:", error);
      throw error;
    }
  }

  /**
   * Migra metadatos de ArchivoAdjunto a PostgreSQL
   */
  async migrateArchivoAdjunto() {
    let sqlPool, pgClient;

    try {
      // Cargar reporte de archivos extraídos
      await this.loadExtractedFilesReport();

      // Conectar a SQL Server
      sqlPool = await sql.connect(sqlServerConfig);
      console.log("✅ Conectado a SQL Server");

      // Conectar a PostgreSQL
      pgClient = new Client(postgresConfig);
      await pgClient.connect();
      console.log("✅ Conectado a PostgreSQL");

      // Obtener metadatos de SQL Server
      const sqlResult = await sqlPool.request().query(`
        SELECT Id, NombreArchivo, Tipo, Ext
        FROM ArchivoAdjunto
        WHERE FileData IS NOT NULL
        ORDER BY Id
      `);

      console.log(
        `📊 Encontrados ${sqlResult.recordset.length} registros en SQL Server`
      );

      // Crear mapeo entre IDs originales y archivos extraídos
      const fileMap = new Map();
      this.extractedFilesReport.forEach((file) => {
        fileMap.set(file.originalId, file);
      });

      let insertedCount = 0;
      let skippedCount = 0;

      // Migrar cada registro
      for (const record of sqlResult.recordset) {
        const { Id, NombreArchivo, Tipo, Ext } = record;
        const extraccionFileInfo = fileMap.get(Id);

        if (!extraccionFileInfo) {
          console.log(
            `⚠️  Archivo ID ${Id} no encontrado en archivos extraídos, saltando...`
          );
          skippedCount++;
          continue;
        }

        try {
          // Insertar en PostgreSQL con referencia al archivo extraído en schema dbo
          const insertQuery = `
            INSERT INTO dbo."ArchivoAdjunto" (
              "Id", 
              "NombreArchivo", 
              "Tipo", 
              "Ext", 
              "FileName"
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT ("Id") DO UPDATE SET
              "NombreArchivo" = EXCLUDED."NombreArchivo",
              "Tipo" = EXCLUDED."Tipo",
              "Ext" = EXCLUDED."Ext",
              "FileName" = EXCLUDED."FileName"
          `;

          await pgClient.query(insertQuery, [
            Id,
            NombreArchivo,
            Tipo,
            Ext,
            extraccionFileInfo.fileName, // Solo el nombre del archivo con extensión
          ]);

          insertedCount++;
          console.log(
            `✅ Migrado: ${NombreArchivo} (ID: ${Id}) → ${extraccionFileInfo.fileName}`
          );
        } catch (insertError) {
          console.error(`❌ Error insertando registro ID ${Id}:`, insertError);
          skippedCount++;
        }
      }

      console.log("\n📊 RESUMEN DE MIGRACIÓN:");
      console.log(`✅ Registros migrados: ${insertedCount}`);
      console.log(`⚠️  Registros saltados: ${skippedCount}`);
      console.log(`📁 Total en SQL Server: ${sqlResult.recordset.length}`);

      return {
        success: true,
        inserted: insertedCount,
        skipped: skippedCount,
        total: sqlResult.recordset.length,
      };
    } catch (error) {
      console.error("❌ Error en migración de ArchivoAdjunto:", error);
      throw error;
    } finally {
      if (sqlPool) {
        await sqlPool.close();
        console.log("✅ Conexión SQL Server cerrada");
      }
      if (pgClient) {
        await pgClient.end();
        console.log("✅ Conexión PostgreSQL cerrada");
      }
    }
  }

  /**
   * Verifica la migración
   */
  async verifyMigration() {
    let pgClient;

    try {
      pgClient = new Client(postgresConfig);
      await pgClient.connect();

      // Contar registros en PostgreSQL (schema dbo)
      const countResult = await pgClient.query(
        'SELECT COUNT(*) as count FROM dbo."ArchivoAdjunto"'
      );
      const pgCount = parseInt(countResult.rows[0].count);

      // Verificar que todos tengan FileName
      const fileNameResult = await pgClient.query(
        'SELECT COUNT(*) as count FROM dbo."ArchivoAdjunto" WHERE "FileName" IS NOT NULL'
      );
      const withFileNameCount = parseInt(fileNameResult.rows[0].count);

      console.log("\n📋 VERIFICACIÓN DE MIGRACIÓN:");
      console.log(`📊 Total registros en PostgreSQL: ${pgCount}`);
      console.log(`📁 Registros con FileName: ${withFileNameCount}`);

      if (pgCount === withFileNameCount) {
        console.log("✅ Todos los registros tienen FileName asignado");
      } else {
        console.log(
          `⚠️  ${pgCount - withFileNameCount} registros sin FileName`
        );
      }

      return {
        totalRecords: pgCount,
        withFileName: withFileNameCount,
        success: pgCount === withFileNameCount,
      };
    } catch (error) {
      console.error("❌ Error verificando migración:", error);
      throw error;
    } finally {
      if (pgClient) {
        await pgClient.end();
      }
    }
  }
}

// Función principal
async function main() {
  console.log("🚀 INICIANDO MIGRACIÓN DE METADATOS DE ARCHIVOS");
  console.log("=".repeat(50));

  try {
    const migrator = new ArchivoAdjuntoMigrator();

    // Ejecutar migración
    const result = await migrator.migrateArchivoAdjunto();

    if (result.success) {
      // Verificar migración
      await migrator.verifyMigration();
      console.log("\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE");

      // 📋 Generar reporte automáticamente
      console.log("📋 Generando reporte de migración...");
      try {
        const generator = new MigrationReportGenerator();
        const reportPath = await generator.generateReport();
        console.log(`✅ Reporte generado exitosamente: ${reportPath}`);
      } catch (error) {
        console.error("❌ Error generando reporte:", error);
        // No fallar la migración por error en reporte
      }
    }
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    process.exit(1);
  }
}

// Ejecutar script
main();
