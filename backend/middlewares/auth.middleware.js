//! middleware de autenticación y autorización (protege rutas de la api)

import { verificarAccessToken } from '../helpers/jwt.helper.js';
import { UnauthorizedError, ForbiddenError } from '../errors/appError.js';

// verifica que el usuario tenga un token válido
function autenticar(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token no proporcionado'));
    }

    const token = authHeader.split(' ')[1];
    const payload = verificarAccessToken(token);
    req.usuario = payload;
    next();
  } catch (err) {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
}

// verifica que el usuario tenga permisos (el rol adecuado)
function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      return next(new ForbiddenError('No tienes permiso para esto'));
    }
    next();
  };
}

export { autenticar, autorizar };
