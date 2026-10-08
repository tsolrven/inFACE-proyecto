//! middleware de manejo de errores global

import { Prisma } from '@prisma/client';
import {
  AppError,
  BadRequestError,
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
      return new ConflictError(
        'No se pudo completar la operación porque otro registro depende de este. Intenta nuevamente.',
      );
    default:
      return new InternalError('Error de base de datos');
  }
}

// procesamiento de errores
const errorHandler = (err, req, res, next) => {
  // convierte error de prisma a AppError
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Prisma error original', {
      code: err.code,
      meta: err.meta,
      message: err.message,
      route: `${req.method} ${req.originalUrl}`,
    });

    err = handlePrismaError(err);
  }

  // errores de multer y body-parser: no son AppError, pero la falla es del cliente (4xx)
  if (err.name === 'MulterError') {
    const mensajes = {
      LIMIT_FILE_SIZE: 'El archivo supera el tamaño máximo permitido (20 MB)',
      LIMIT_UNEXPECTED_FILE: 'Campo de archivo inesperado',
    };
    err = new BadRequestError(
      mensajes[err.code] || 'Error al subir el archivo',
    );
  } else if (err.type === 'entity.parse.failed') {
    err = new BadRequestError('El cuerpo de la petición no es un JSON válido');
  } else if (
    !(err instanceof AppError) &&
    err.statusCode >= 400 &&
    err.statusCode < 500
  ) {
    err = new AppError(err.message, err.statusCode, err.code || 'BAD_REQUEST');
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
