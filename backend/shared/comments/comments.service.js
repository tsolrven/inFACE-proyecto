import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/appError.js';
import {
  verificarContenidoExiste,
  registrarHidratadorGuardados,
} from '../content/contentRegistry.js';
import { eliminarInteracciones } from '../content/contentCleanup.js';
import { esStaff } from '../auth/permissions.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarComentarios(tipo_contenido, contenido_id, usuario_id) {
  const comentarios = await prisma.comentario.findMany({
    where: { tipo_contenido, contenido_id },
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
async function crearComentario({
  autor_id,
  tipo_contenido,
  contenido_id,
  contenido,
  padre_id,
}) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);

  let nivel = 0;
  if (padre_id) {
    const padre = await prisma.comentario.findUnique({
      where: { id: padre_id },
    });
    if (!padre) throw new NotFoundError('Comentario padre');
    if (
      padre.tipo_contenido !== tipo_contenido ||
      padre.contenido_id !== contenido_id
    ) {
      throw new BadRequestError(
        'El comentario padre no pertenece a este contenido',
      );
    }
    nivel = padre.nivel + 1;
    if (nivel > 50) {
      throw new BadRequestError('Se alcanzó el límite máximo de anidamiento');
    }
  }

  const comentario = await prisma.comentario.create({
    data: {
      autor_id,
      tipo_contenido,
      contenido_id,
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

  // solo el autor edita (ni siquiera staff: moderar es borrar, no reescribir)
  if (comentario.autor_id !== usuario_id) {
    throw new ForbiddenError('No tienes permiso para editar este comentario');
  }

  if (comentario.eliminado) {
    throw new BadRequestError('No puedes editar un comentario eliminado');
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
async function eliminarComentario(comentario_id, usuario_id, rol) {
  const comentario = await prisma.comentario.findUnique({
    where: { id: comentario_id },
  });
  if (!comentario) throw new NotFoundError('Comentario');

  // el autor o staff pueden eliminar
  if (comentario.autor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este comentario');
  }

  const cantidadRespuestas = await prisma.comentario.count({
    where: { padre_id: comentario_id },
  });

  // sin respuestas: se borra de verdad, con todo lo que cuelga de él
  if (cantidadRespuestas === 0) {
    await prisma.$transaction(async (tx) => {
      await eliminarInteracciones(tx, 'comentario', [comentario_id]);
      await tx.comentario.delete({ where: { id: comentario_id } });
    });
    return { eliminado_permanente: true, comentario: null };
  }

  // con respuestas: queda como "[eliminado]" para no romper el hilo,
  // pero nadie debe seguir teniéndolo guardado
  const actualizado = await prisma.$transaction(async (tx) => {
    await tx.guardado.deleteMany({
      where: { tipo_contenido: 'comentario', contenido_id: comentario_id },
    });
    return tx.comentario.update({
      where: { id: comentario_id },
      data: { eliminado: true },
      include: {
        autor: { include: { perfil: { select: { nombre_usuario: true } } } },
      },
    });
  });

  return {
    eliminado_permanente: false,
    comentario: formatearComentario(actualizado),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarComentariosGuardados(ids, usuario_id) {
  const comentarios = await prisma.comentario.findMany({
    where: { id: { in: ids } },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
    },
  });

  const mapComentarios = Object.fromEntries(comentarios.map((c) => [c.id, c]));
  const misVotos = await prisma.voto.findMany({
    where: {
      usuario_id,
      tipo_contenido: 'comentario',
      contenido_id: { in: ids },
    },
  });
  const mapVotos = Object.fromEntries(
    misVotos.map((v) => [v.contenido_id, v.tipo]),
  );

  const apunteIds = [...new Set(comentarios.map((c) => c.contenido_id))];
  const apuntesRelacionados = await prisma.apunte.findMany({
    where: { id: { in: apunteIds } },
    select: { id: true, titulo: true },
  });
  const mapApuntesRelacionados = Object.fromEntries(
    apuntesRelacionados.map((a) => [a.id, a]),
  );

  return ids
    .filter((id) => mapComentarios[id])
    .map((id) => {
      const comentario = mapComentarios[id];
      return {
        ...formatearComentario(comentario, {
          mi_voto: mapVotos[id] || null,
          esta_guardado: true,
        }),
        apunte: mapApuntesRelacionados[comentario.contenido_id] || null,
      };
    });
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
registrarHidratadorGuardados('comentario', hidratarComentariosGuardados);
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarComentarios,
  crearComentario,
  editarComentario,
  eliminarComentario,
  formatearComentario,
};
