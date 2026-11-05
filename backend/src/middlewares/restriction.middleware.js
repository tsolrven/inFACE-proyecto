import { AccountRestrictedError } from '../errors/appError.js';
import { obtenerSancionesVigentes } from '../shared/moderation/sanctions.service.js';

// Bloquea crear y editar contenido (publicaciones, comentarios, archivos,
// flairs) a quien tiene una restricción temporal vigente. Va justo después de
// `autenticar` (y de exigirEscritura / autorizar si la ruta los usa) y ANTES
// de multer: no se escribe nada en disco.
// Leer, votar, guardar, reportar y eliminar contenido propio NO lo usan.
async function exigirSinRestriccion(req, res, next) {
  try {
    const { restriccion } = await obtenerSancionesVigentes(req.usuario.id);
    if (restriccion) return next(new AccountRestrictedError(restriccion));
    next();
  } catch (err) {
    next(err);
  }
}

export { exigirSinRestriccion };