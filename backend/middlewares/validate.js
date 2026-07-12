//! middleware de validación de datos que usa zod para verificar que los datos enviados por el cliente cumplan con un esquema definido

import { ValidationError } from '../errors/AppError.js';

const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    const result = await schema.safeParseAsync(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ValidationError('Error de validación', details));
    }
    req[source] = result.data;
    next();
  };
};

export default validate;
