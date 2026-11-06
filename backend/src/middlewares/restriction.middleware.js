import { AccountRestrictedError } from '../errors/appError.js';

// Bloquea crear y editar contenido (publicaciones, comentarios, archivos,
// flairs) a quien tiene una restricción temporal vigente. `autenticar` ya
// trajo la restricción en req.usuario: no hay consulta extra. Va justo después
// de `autenticar` (y de exigirEscritura / autorizar si la ruta los usa) y ANTES
// de multer: no se escribe nada en disco.
// Leer, votar, guardar, reportar y eliminar contenido propio NO lo usan.
function exigirSinRestriccion(req, res, next) {
  if (req.usuario?.restriccion) {
    return next(new AccountRestrictedError(req.usuario.restriccion));
  }
  next();
}

export { exigirSinRestriccion };