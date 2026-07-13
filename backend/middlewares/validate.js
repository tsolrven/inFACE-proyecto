//! middleware de validación de datos que usa zod para verificar que los datos enviados por el cliente cumplan con un esquema definido

import { ValidationError } from '../errors/appError.js';

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ValidationError('Error de validación', details));
    }

    if (source === 'query') {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, result.data);
    } else {
      req[source] = result.data;
    }

    next();
  };
};

export default validate;
