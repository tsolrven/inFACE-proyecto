//! middleware para manejar rutas no encontradas (404), se ejecuta cuando ninguna ruta de la api coincide con la petición del cliente

import { NotFoundError } from '../errors/appError.js';

const notFound = (req, res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl}`));
};

export default notFound;
