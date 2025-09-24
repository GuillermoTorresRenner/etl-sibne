import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, "../../.env") });

/**
 * Configuración centralizada para el ETL SIBNE
 */
export const config = {
  // SQL Server Configuration
  sqlServer: {
    user: "SA",
    password: process.env.SA_PASSWORD,
    server: process.env.SQL_HOST || "localhost",
    port: parseInt(process.env.SQL_PORT) || 1433,
    database: process.env.DB_NAME || "SIBNE_ETL",
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      connectionTimeout: 30000,
      requestTimeout: 60000,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },

  // PostgreSQL Configuration
  postgresql: {
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "postgres",
    host: process.env.PG_HOST || "localhost",
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || "sibne_migrated",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // ETL Configuration
  etl: {
    batchSize: parseInt(process.env.BATCH_SIZE) || 1000,
    concurrency: parseInt(process.env.CONCURRENCY) || 3,
    csvExport: process.env.CSV_EXPORT === "true" || true,
    validateData: process.env.VALIDATE_DATA === "true" || true,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 5000,
  },

  // Paths Configuration
  paths: {
    csvOutput: process.env.CSV_OUTPUT_PATH || "./Tablas",
    logs: process.env.LOGS_PATH || "./logs",
    temp: process.env.TEMP_PATH || "./temp",
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    maxSize: process.env.LOG_MAX_SIZE || "10m",
  },
};

/**
 * Validar configuración crítica
 */
export function validateConfig() {
  const errors = [];

  if (!config.sqlServer.password) {
    errors.push("SA_PASSWORD is required for SQL Server connection");
  }

  if (!config.postgresql.password) {
    errors.push("PG_PASSWORD is required for PostgreSQL connection");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }

  return true;
}

export default config;
