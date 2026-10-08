//! middleware de validación de datos que usa zod para verificar que los datos enviados por el cliente cumplan con un esquema definido

import { ValidationError } from '../errors/appError.js';

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

    if (source === 'query') {
      // Express 5: req.query se recalcula en cada acceso, así que mutarlo no persiste.
      // Se reemplaza por el resultado validado (números ya convertidos, defaults aplicados).
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[source] = result.data;
    }

    next();
  };
};

export default validate;
