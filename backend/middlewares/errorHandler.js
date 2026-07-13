//! middleware de manejo de errores global

import { Prisma } from '@prisma/client';
import {
  AppError,
  ConflictError,
  NotFoundError,
  InternalError,
} from '../errors/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import logger from '../lib/logger.js';

// manejo de errores de prisma (traduce errores específicos de la bd en errores de aplicación)
function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002': {
      const field = err.meta?.target?.join(', ') || 'campo';
      return new ConflictError(`Ya existe un registro con ese ${field}`);
    }
    case 'P2025':
      return new NotFoundError(err.meta?.modelName || 'Recurso');
    case 'P2003':
      return new InternalError('Referencia a un recurso inexistente');
    default:
      return new InternalError('Error de base de datos');
  }
}

// procesamiento de errores
const errorHandler = (err, req, res, next) => {
  // convierte error de prisma a AppError
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    err = handlePrismaError(err);
  }
  // errores de aplicación
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, {
        code: err.code,
        stack: err.stack,
        route: `${req.method} ${req.originalUrl}`,
        userId: req.usuario?.id ?? null,
      });
    }
    return ApiResponse.error(
      res,
      err.statusCode,
      err.code,
      err.message,
      err.details ?? null,
    );
  }
  // errores inésperados (si no es prisma ni AppError, es un error genérico)
  logger.error('Error inesperado no operacional', {
    message: err.message,
    stack: err.stack,
    route: `${req.method} ${req.originalUrl}`,
    userId: req.usuario?.id ?? null,
  });

  return ApiResponse.error(
    res,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  );
};

export default errorHandler;
