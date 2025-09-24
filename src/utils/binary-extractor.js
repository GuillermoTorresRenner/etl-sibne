import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import sql from 'mssql';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de SQL Server
const sqlConfig = {
  server: 'localhost',
  port: 1433,
  database: 'SIBNE_ETL',
  user: 'sa',
  password: '4Emperador*',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Configuración de rutas desde variables de entorno
const BINARY_EXTRACTION_PATH = process.env.BINARY_EXTRACTION_PATH || 'extracted_files';
const RELATIVE_PATH = process.env.FILE_RELATIVE_PATH || '/uploads/';

/**
 * Extrae archivos binarios de SQL Server y los guarda con nombres nanoid
 */
class BinaryExtractor {
  constructor() {
    this.extractPath = path.resolve(BINARY_EXTRACTION_PATH);
  }

  /**
   * Inicializa el directorio de extracción
   */
  async initializeDirectory() {
    try {
      await fs.mkdir(this.extractPath, { recursive: true });
      console.log(`✅ Directorio de extracción creado/verificado: ${this.extractPath}`);
    } catch (error) {
      console.error('❌ Error creando directorio de extracción:', error);
      throw error;
    }
  }

  /**
   * Extrae todos los archivos binarios de la tabla ArchivoAdjunto
   */
  async extractAllBinaryFiles() {
    let pool;
    
    try {
      // Inicializar directorio
      await this.initializeDirectory();
      
      // Conectar a SQL Server
      pool = await sql.connect(sqlConfig);
      console.log('✅ Conectado a SQL Server');

      // Consultar archivos con datos binarios
      const result = await pool.request().query(`
        SELECT Id, NombreArchivo, Tipo, Ext, FileData
        FROM ArchivoAdjunto
        WHERE FileData IS NOT NULL
      `);

      console.log(`📁 Encontrados ${result.recordset.length} archivos para extraer`);

      const extractedFiles = [];

      for (const record of result.recordset) {
        try {
          const { Id, NombreArchivo, Tipo, Ext, FileData } = record;
          
          // Generar nanoid para el archivo
          const nanoId = nanoid();
          
          // Construir nombre del archivo con extensión
          const fileName = `${nanoId}.${Ext || 'bin'}`;
          const filePath = path.join(this.extractPath, fileName);
          
          // Escribir archivo binario
          await fs.writeFile(filePath, FileData);
          
          // Construir ruta relativa para la base de datos
          const relativePath = path.posix.join(RELATIVE_PATH, fileName);
          
          const fileInfo = {
            originalId: Id,
            originalName: NombreArchivo,
            type: Tipo,
            extension: Ext,
            nanoId: nanoId,
            fileName: fileName,
            extractedPath: filePath,
            relativePath: relativePath,
            location: relativePath // Para compatibilidad con el campo Location
          };

          extractedFiles.push(fileInfo);
          console.log(`✅ Extraído: ${NombreArchivo} → ${fileName}`);
          
        } catch (fileError) {
          console.error(`❌ Error extrayendo archivo ID ${record.Id}:`, fileError);
        }
      }

      console.log(`🎉 Extracción completada: ${extractedFiles.length} archivos extraídos`);
      return extractedFiles;
      
    } catch (error) {
      console.error('❌ Error en la extracción de archivos binarios:', error);
      throw error;
    } finally {
      if (pool) {
        await pool.close();
        console.log('✅ Conexión a SQL Server cerrada');
      }
    }
  }

  /**
   * Genera reporte de archivos extraídos
   */
  generateExtractionReport(extractedFiles) {
    console.log('\n📋 REPORTE DE EXTRACCIÓN DE ARCHIVOS BINARIOS');
    console.log('='.repeat(50));
    console.log(`📁 Directorio de extracción: ${this.extractPath}`);
    console.log(`📊 Total de archivos extraídos: ${extractedFiles.length}`);
    console.log('📋 Detalle de archivos:');
    
    extractedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalName}`);
      console.log(`     • ID Original: ${file.originalId}`);
      console.log(`     • Nano ID: ${file.nanoId}`);
      console.log(`     • Archivo: ${file.fileName}`);
      console.log(`     • Ubicación: ${file.location}`);
      console.log('');
    });
  }
}

export { BinaryExtractor };