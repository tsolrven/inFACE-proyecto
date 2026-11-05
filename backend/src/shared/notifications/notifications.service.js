import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { NotFoundError } from '../../errors/appError.js';

const MAX_POR_PAGINA = 50;

async function notificar({
  usuarioId,
  tipo,
  titulo,
  mensaje = null,
  enlace = null,
  actorId = null,
}) {
  try {
    if (!usuarioId || usuarioId === actorId) return null;
    return await prisma.notificacion.create({
      data: {
        usuario_id: usuarioId,
        tipo,
        titulo: String(titulo).slice(0, 150),
        mensaje: mensaje ? String(mensaje).slice(0, 500) : null,
        enlace,
      },
    });
  } catch (error) {
    logger.error('No se pudo crear la notificación', {
      tipo,
      usuarioId,
      error: error.message,
    });
    return null;
  }
}

async function notificarVarios({ usuarioIds, actorId = null, ...datos }) {
  const destinos = [...new Set(usuarioIds)].filter(
    (id) => id && id !== actorId,
  );
  try {
    if (destinos.length === 0) return 0;
    const { count } = await prisma.notificacion.createMany({
      data: destinos.map((usuario_id) => ({
        usuario_id,
        tipo: datos.tipo,
        titulo: String(datos.titulo).slice(0, 150),
        mensaje: datos.mensaje ? String(datos.mensaje).slice(0, 500) : null,
        enlace: datos.enlace ?? null,
      })),
    });
    return count;
  } catch (error) {
    logger.error('No se pudieron crear las notificaciones', {
      tipo: datos.tipo,
      error: error.message,
    });
    return 0;
  }
}

function formatearNotificacion(n) {
  return {
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    mensaje: n.mensaje,
    enlace: n.enlace,
    leida: n.leida,
    creado_en: n.creado_en,
  };
}

async function listarMisNotificaciones(
  usuarioId,
  { limite = 20, soloNoLeidas = false } = {},
) {
  const take = Math.min(Math.max(Number(limite) || 20, 1), MAX_POR_PAGINA);
  const where = {
    usuario_id: usuarioId,
    ...(soloNoLeidas && { leida: false }),
  };
  const [items, no_leidas] = await Promise.all([
    prisma.notificacion.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      take,
    }),
    prisma.notificacion.count({
      where: { usuario_id: usuarioId, leida: false },
    }),
  ]);
  return { items: items.map(formatearNotificacion), no_leidas };
}

async function marcarComoLeida(id, usuarioId) {
  const { count } = await prisma.notificacion.updateMany({
    where: { id, usuario_id: usuarioId },
    data: { leida: true },
  });
  if (count === 0) throw new NotFoundError('Notificación');
  return { mensaje: 'Notificación marcada como leída' };
}

async function marcarTodasComoLeidas(usuarioId) {
  const { count } = await prisma.notificacion.updateMany({
    where: { usuario_id: usuarioId, leida: false },
    data: { leida: true },
  });
  return { actualizadas: count };
}

async function eliminarNotificacion(id, usuarioId) {
  const { count } = await prisma.notificacion.deleteMany({
    where: { id, usuario_id: usuarioId },
  });
  if (count === 0) throw new NotFoundError('Notificación');
  return { mensaje: 'Notificación eliminada' };
}

export {
  notificar,
  notificarVarios,
  listarMisNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
};
