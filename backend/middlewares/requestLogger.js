//! lógica de loggin http

import logger from '../lib/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const shouldLog =
      process.env.NODE_ENV !== 'production' || res.statusCode >= 400;

    if (!shouldLog) {
      return originalSend.call(this, data);
    }

    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.usuario?.id || 'anonymous',
    };

    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl}`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl}`, logData);
    } else {
      logger.info(`${req.method} ${req.originalUrl}`, logData);
    }

    originalSend.call(this, data);
  };

  next();
};

export default requestLogger;
