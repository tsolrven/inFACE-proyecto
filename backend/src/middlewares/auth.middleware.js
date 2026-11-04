//! middleware de autenticación y autorización (protege rutas de la api)

import { prisma } from '../config/configDb.js';
import { verificarAccessToken } from '../shared/auth/jwt.helper.js';
import { ORDEN_CARRERAS_USUARIO } from '../shared/auth/carreraPrincipal.js';
import { UnauthorizedError, ForbiddenError } from '../errors/appError.js';

// verifica que el token sea válido Y que el usuario siga existiendo y activo.
// El rol y la carrera se leen de la BD en cada petición: el payload del token
// puede estar desactualizado hasta 15 min (usuario desactivado, rol cambiado).
async function autenticar(req, res, next) {
  let payload;
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token no proporcionado'));
    }

    const token = authHeader.split(' ')[1];
    payload = verificarAccessToken(token);
  } catch {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        rol: true,
        esta_activo: true,
        usuario_carrera: {
          select: { carrera_id: true },
          orderBy: ORDEN_CARRERAS_USUARIO,
          take: 1,
        },
      },
    });

    // 401 (no 403): el cliente intenta refrescar, el refresh rechaza al usuario
    // desactivado y la sesión se cierra sola
    if (!usuario || !usuario.esta_activo) {
      return next(new UnauthorizedError('Sesión no válida'));
    }

    req.usuario = {
      id: usuario.id,
      rol: usuario.rol,
      carrera_id: usuario.usuario_carrera[0]?.carrera_id ?? null,
    };
    next();
  } catch (err) {
    // un fallo de BD es un 500, no un 401 (si no, el cliente intentaría refrescar)
    next(err);
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
