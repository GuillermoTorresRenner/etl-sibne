import winston from "winston";
import { config } from "../config/database.js";
import { existsSync, mkdirSync } from "node:fs";

// Crear directorio de logs si no existe
if (!existsSync(config.paths.logs)) {
  mkdirSync(config.paths.logs, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * Logger configurado para el ETL SIBNE
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // Archivo para todos los logs
    new winston.transports.File({
      filename: `${config.paths.logs}/etl-combined.log`,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
    // Archivo solo para errores
    new winston.transports.File({
      filename: `${config.paths.logs}/etl-errors.log`,
      level: "error",
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
    // Consola con formato amigable
    new winston.transports.Console({
      format: consoleFormat,
      level: "info",
    }),
  ],
});

/**
 * Logger específico para tablas
 */
export function createTableLogger(tableName) {
  return winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: [
      new winston.transports.File({
        filename: `${config.paths.logs}/tables/table-${tableName}.log`,
        maxsize: "5m",
        maxFiles: 2,
      }),
      new winston.transports.Console({
        format: consoleFormat,
        level: "warn",
      }),
    ],
  });
}

export default logger;
