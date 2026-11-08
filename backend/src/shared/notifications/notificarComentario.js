import { prisma } from '../../config/configDb.js';
import { notificar } from './notifications.service.js';

const PREVIEW_MAX = 120;

function recortar(texto) {
  const limpio = String(texto ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return limpio.length > PREVIEW_MAX
    ? `${limpio.slice(0, PREVIEW_MAX).trimEnd()}…`
    : limpio;
}

async function avisarComentario({
  actorId,
  comentarioId,
  padreId,
  duenoId,
  nombreContenido,
  ruta,
  dueno,
  respuesta,
  respuestaDelDueno = null,
}) {
  const [perfil, comentario, padre] = await Promise.all([
    prisma.perfil.findUnique({
      where: { usuario_id: actorId },
      select: { nombre_usuario: true },
    }),
    prisma.comentario.findUnique({
      where: { id: comentarioId },
      select: { contenido: true },
    }),
    padreId
      ? prisma.comentario.findUnique({
          where: { id: padreId },
          select: { autor_id: true },
        })
      : null,
  ]);

  const quien = perfil?.nombre_usuario
    ? `u/${perfil.nombre_usuario}`
    : 'Alguien';
  const enlace = `${ruta}?comentario=${comentarioId}`;
  const mensaje = (verbo) =>
    `${quien} ${verbo} «${recortar(nombreContenido)}»: «${recortar(comentario?.contenido)}»`;

  const padreAutorId = padre?.autor_id ?? null;

  if (padreAutorId) {
    const cfg =
      actorId === duenoId && respuestaDelDueno ? respuestaDelDueno : respuesta;
    await notificar({
      usuarioId: padreAutorId,
      actorId,
      tipo: cfg.tipo,
      titulo: cfg.titulo,
      mensaje: mensaje(cfg.verbo),
      enlace,
    });
  }

  if (duenoId && duenoId !== padreAutorId) {
    await notificar({
      usuarioId: duenoId,
      actorId,
      tipo: dueno.tipo,
      titulo: dueno.titulo,
      mensaje: mensaje(dueno.verbo),
      enlace,
    });
  }
}

export { avisarComentario };
