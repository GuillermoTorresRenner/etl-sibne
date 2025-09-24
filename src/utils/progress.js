import { logger } from "./logger.js";

/**
 * Barra de progreso para el ETL
 */
export class ProgressBar {
  constructor(total, title = "Progreso") {
    this.total = total;
    this.current = 0;
    this.title = title;
    this.startTime = Date.now();
    this.lastUpdate = 0;
  }

  /**
   * Incrementar progreso
   */
  increment(itemName = "") {
    this.current++;
    const now = Date.now();

    // Actualizar cada segundo o al final
    if (now - this.lastUpdate > 1000 || this.current === this.total) {
      this.update(itemName);
      this.lastUpdate = now;
    }
  }

  /**
   * Actualizar display del progreso
   */
  update(itemName = "") {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const rate = this.current / elapsed;
    const eta =
      this.current > 0 ? Math.round((this.total - this.current) / rate) : 0;

    const progressBar = this._createProgressBar(percentage);

    const message = [
      `📊 ${this.title}: ${progressBar} ${percentage}%`,
      `(${this.current}/${this.total})`,
      itemName ? `- ${itemName}` : "",
      elapsed > 0 ? `- ${elapsed}s transcurridos` : "",
      eta > 0 && this.current < this.total ? `- ETA: ${eta}s` : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (this.current === this.total) {
      logger.info(`✅ ${message} - ¡COMPLETADO!`);
    } else {
      logger.info(message);
    }
  }

  /**
   * Crear representación visual de la barra
   */
  _createProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
  }

  /**
   * Finalizar progreso
   */
  complete(message = "Proceso completado") {
    this.current = this.total;
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    logger.info(`✅ ${message} - Tiempo total: ${totalTime}s`);
  }

  /**
   * Marcar como error
   */
  error(message = "Proceso falló") {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    logger.error(`❌ ${message} - Tiempo transcurrido: ${totalTime}s`);
  }
}

export default ProgressBar;
