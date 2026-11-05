import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import {
  esStaff,
  puedePublicarAnuncioEn,
} from '../../shared/auth/permissions.js';
import { normalizarNombreFlair } from './flairs.validation.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const MENSAJE_DUPLICADO = 'Ya existe un flair con ese nombre en esta carrera';

function formatearFlair(flair) {
  return {
    id: flair.id,
    carrera_id: flair.carrera_id,
    nombre: flair.nombre,
    color: flair.color,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// La condición de carrera entre dos creaciones iguales la resuelve el índice único:
// aquí se traduce su error a un mensaje claro.
function traducirDuplicado(err) {
  if (err?.code === 'P2002') return new ConflictError(MENSAJE_DUPLICADO);
  return err;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cualquier usuario con sesión ve los flairs de cualquier carrera; por defecto
// el controlador pasa la suya.
async function listarFlairs({ carrera_id }) {
  if (!carrera_id) return [];

  const flairs = await prisma.flair.findMany({
    where: { carrera_id },
    orderBy: [{ nombre_normalizado: 'asc' }, { id: 'asc' }],
  });
  return flairs.map(formatearFlair);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearFlair({ usuario, nombre, color }) {
  // la carrera es siempre la del usuario: no viaja en el body
  const destino = usuario.carrera_id;
  if (!destino) throw new BadRequestError('No tienes una carrera asignada');
  if (!puedePublicarAnuncioEn(usuario, destino)) {
    throw new ForbiddenError(
      'No tienes permiso para administrar flairs en esta carrera',
    );
  }

  const carrera = await prisma.carrera.findUnique({
    where: { id: destino },
    select: { id: true },
  });
  if (!carrera) throw new NotFoundError('Carrera');

  try {
    const flair = await prisma.flair.create({
      data: {
        carrera_id: destino,
        nombre,
        nombre_normalizado: normalizarNombreFlair(nombre),
        color,
      },
    });
    return formatearFlair(flair);
  } catch (err) {
    throw traducirDuplicado(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Crear/editar: CEE o tutor de la carrera del flair. Eliminar (soloEliminar):
// además el superadmin, como moderación.
async function exigirPermisoSobreFlair(id, usuario, { eliminar = false } = {}) {
  const flair = await prisma.flair.findUnique({ where: { id } });
  if (!flair) throw new NotFoundError('Flair');

  const permitido =
    (eliminar && esStaff(usuario.rol)) ||
    puedePublicarAnuncioEn(usuario, flair.carrera_id);
  if (!permitido) {
    throw new ForbiddenError(
      'No tienes permiso para administrar flairs en esta carrera',
    );
  }
  return flair;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarFlair(id, usuario, { nombre, color }) {
  const flair = await exigirPermisoSobreFlair(id, usuario);

  // sin campos: nada que escribir
  if (nombre === undefined && color === undefined) return formatearFlair(flair);

  try {
    const actualizado = await prisma.flair.update({
      where: { id },
      data: {
        ...(nombre !== undefined && {
          nombre,
          nombre_normalizado: normalizarNombreFlair(nombre),
        }),
        ...(color !== undefined && { color }),
      },
    });
    return formatearFlair(actualizado);
  } catch (err) {
    throw traducirDuplicado(err);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarFlair(id, usuario) {
  await exigirPermisoSobreFlair(id, usuario, { eliminar: true });

  // los anuncios que lo usaban quedan sin flair (onDelete: SetNull en el esquema)
  await prisma.flair.delete({ where: { id } });

  logger.info('Flair eliminado', { flair_id: id, eliminado_por: usuario.id });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarFlairs, crearFlair, actualizarFlair, eliminarFlair };
