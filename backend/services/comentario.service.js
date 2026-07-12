import { prisma } from '../config/configDb.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarComentarios(apunte_id, usuario_id) {
  const comentarios = await prisma.comentario.findMany({
    where: { tipo_contenido: 'apunte', contenido_id: apunte_id },
    orderBy: { creado_en: 'asc' },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
    },
  });

  const misVotos = usuario_id
    ? await prisma.voto.findMany({
        where: {
          usuario_id,
          tipo_contenido: 'comentario',
          contenido_id: { in: comentarios.map((c) => c.id) },
        },
      })
    : [];
  const mapVotos = Object.fromEntries(
    misVotos.map((v) => [v.contenido_id, v.tipo]),
  );

  const misGuardados = usuario_id
    ? await prisma.guardado.findMany({
        where: {
          usuario_id,
          tipo_contenido: 'comentario',
          contenido_id: { in: comentarios.map((c) => c.id) },
        },
      })
    : [];
  const setGuardados = new Set(misGuardados.map((g) => g.contenido_id));

  return construirArbolComentarios(comentarios, mapVotos, setGuardados);
}
// ────────────────────────────────────────────────────────────────────────────────────────
function construirArbolComentarios(
  comentarios,
  mapVotos = {},
  setGuardados = new Set(),
) {
  const nodosPorId = new Map();
  const raices = [];

  for (const c of comentarios) {
    nodosPorId.set(c.id, {
      ...formatearComentario(c, {
        mi_voto: mapVotos[c.id] || null,
        esta_guardado: setGuardados.has(c.id),
      }),
      respuestas: [],
    });
  }

  for (const c of comentarios) {
    const nodo = nodosPorId.get(c.id);
    const padre = c.padre_id ? nodosPorId.get(c.padre_id) : null;
    if (padre) {
      padre.respuestas.push(nodo);
    } else {
      raices.push(nodo);
    }
  }

  return raices;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearComentario({ autor_id, apunte_id, contenido, padre_id }) {
  const apunte = await prisma.apunte.findUnique({ where: { id: apunte_id } });
  if (!apunte) throw new NotFoundError('Apunte');

  let nivel = 0;
  if (padre_id) {
    const padre = await prisma.comentario.findUnique({
      where: { id: padre_id },
    });
    if (!padre) throw new NotFoundError('Comentario padre');
    nivel = padre.nivel + 1;
    // Tope de seguridad (no un límite real de UX): evita hilos absurdos o
    // recursión maliciosa, pero en la práctica el usuario nunca lo alcanza.
    // El indentado visual se limita aparte en el frontend (ver MAX_NIVEL_INDENTADO
    // en CommentThread.jsx), al estilo Reddit.
    if (nivel > 50) {
      throw new BadRequestError('Se alcanzó el límite máximo de anidamiento');
    }
  }

  const comentario = await prisma.comentario.create({
    data: {
      autor_id,
      tipo_contenido: 'apunte',
      contenido_id: apunte_id,
      contenido,
      padre_id: padre_id || null,
      nivel,
    },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
    },
  });

  return formatearComentario(comentario);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function editarComentario(comentario_id, usuario_id, contenido) {
  const comentario = await prisma.comentario.findUnique({
    where: { id: comentario_id },
  });
  if (!comentario) throw new NotFoundError('Comentario');

  if (comentario.autor_id !== usuario_id) {
    throw new ForbiddenError('No tienes permiso para editar este comentario');
  }

  const actualizado = await prisma.comentario.update({
    where: { id: comentario_id },
    data: { contenido },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
    },
  });

  return formatearComentario(actualizado);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarComentario(comentario_id, usuario_id) {
  const comentario = await prisma.comentario.findUnique({
    where: { id: comentario_id },
  });
  if (!comentario) throw new NotFoundError('Comentario');

  if (comentario.autor_id !== usuario_id) {
    throw new ForbiddenError('No tienes permiso para eliminar este comentario');
  }

  const cantidadRespuestas = await prisma.comentario.count({
    where: { padre_id: comentario_id },
  });

  if (cantidadRespuestas === 0) {
    // sin respuestas: se elimina por completo, no hay nada que preservar
    await prisma.$transaction([
      prisma.voto.deleteMany({
        where: { tipo_contenido: 'comentario', contenido_id: comentario_id },
      }),
      prisma.comentario.delete({ where: { id: comentario_id } }),
    ]);
    return { eliminado_permanente: true, comentario: null };
  }

  // tiene respuestas: se preserva el nodo para no romper el hilo (soft-delete)
  const actualizado = await prisma.comentario.update({
    where: { id: comentario_id },
    data: { eliminado: true },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
    },
  });

  return {
    eliminado_permanente: false,
    comentario: formatearComentario(actualizado),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
function formatearComentario(
  comentario,
  { mi_voto = null, esta_guardado = false } = {},
) {
  if (comentario.eliminado) {
    return {
      id: comentario.id,
      contenido: null,
      votos_neto: comentario.votos_neto,
      mi_voto: null,
      esta_guardado,
      nivel: comentario.nivel,
      creado_en: comentario.creado_en,
      actualizado_en: comentario.actualizado_en,
      eliminado: true,
      autor: null,
    };
  }

  return {
    id: comentario.id,
    contenido: comentario.contenido,
    votos_neto: comentario.votos_neto,
    mi_voto,
    esta_guardado,
    nivel: comentario.nivel,
    creado_en: comentario.creado_en,
    actualizado_en: comentario.actualizado_en,
    eliminado: false,
    autor: {
      id: comentario.autor.id,
      nombre_usuario: comentario.autor.perfil?.nombre_usuario,
    },
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario,
  formatearComentario,
};
