//! errores personalizados para diferentes situaciones http

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida') {
    super(message, 400, 'BAD_REQUEST');
  }
}
class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}
class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}
class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(message, 409, 'CONFLICT');
  }
}
class ValidationError extends AppError {
  constructor(message = 'Error de validación', details = []) {
    super(message, 422, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Cuenta con una restricción temporal vigente: no puede crear ni editar contenido.
// Al cliente solo le llegan el motivo y el término, no el resto de la sanción.
class AccountRestrictedError extends AppError {
  constructor(restriccion) {
    super(
      'Tu cuenta tiene una restricción temporal: no puedes crear ni editar contenido mientras dure.',
      403,
      'CUENTA_RESTRINGIDA',
    );
    this.details = { motivo: restriccion.motivo, hasta: restriccion.hasta };
  }
}

class InternalError extends AppError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  AccountRestrictedError,
  InternalError,
};
