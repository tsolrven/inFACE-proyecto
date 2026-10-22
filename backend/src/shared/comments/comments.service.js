import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/appError.js';
import {
  verificarContenidoExiste,
  registrarHidratadorGuardados,
  obtenerPreviewsContenido,
} from '../content/contentRegistry.js';
import { eliminarInteracciones } from '../content/contentCleanup.js';
import { obtenerMisInteracciones } from '../content/contentEnrichment.js';
import { esStaff } from '../auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../content/selects.js';
import { MAX_NIVEL_COMENTARIO } from './comments.constants.js';

const INCLUDE_AUTOR = { autor: { select: AUTOR_PUBLICO_SELECT } };

// ────────────────────────────────────────────────────────────────────────────────────────
async function listarComentarios(tipo_contenido, contenido_id, usuario_id) {
  const comentarios = await prisma.comentario.findMany({
    where: { tipo_contenido, contenido_id },
    orderBy: { creado_en: 'asc' },
    include: INCLUDE_AUTOR,
  });

  const { mapVotos, setGuardados } = await obtenerMisInteracciones(
    'comentario',
    comentarios.map((c) => c.id),
    usuario_id,
  );

  return construirArbolComentarios(comentarios, mapVotos, setGuardados);
}
// ────────────────────────────────────────────────────────────────────────────────────────
function construirArbolComentarios(
  comentarios,
  mapVotos = new Map(),
  setGuardados = new Set(),
) {
  const nodosPorId = new Map();
  const raices = [];

  for (const c of comentarios) {
    nodosPorId.set(c.id, {
      ...formatearComentario(c, {
        mi_voto: mapVotos.get(c.id) ?? null,
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
    if (padre.eliminado) {
      throw new BadRequestError(
        'No puedes responder a un comentario eliminado',
      );
    }
    if (
      padre.tipo_contenido !== tipo_contenido ||
      padre.contenido_id !== contenido_id
    ) {
      throw new BadRequestError(
        'El comentario padre no pertenece a este contenido',
      );
    }
    nivel = padre.nivel + 1;
    if (nivel > MAX_NIVEL_COMENTARIO) {
      throw new BadRequestError(
        `Se alcanzó el máximo de ${MAX_NIVEL_COMENTARIO} niveles de respuestas`,
      );
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
    include: INCLUDE_AUTOR,
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
    data: { contenido, editado_en: new Date() },
    include: INCLUDE_AUTOR,
  });

  return formatearComentario(actualizado);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarComentario(comentario_id, usuario_id, rol) {
  const comentario = await prisma.comentario.findUnique({
    where: { id: comentario_id },
  });
  if (!comentario) throw new NotFoundError('Comentario');
  if (comentario.eliminado) {
    throw new BadRequestError('Este comentario ya fue eliminado');
  }

  const esAutor = comentario.autor_id === usuario_id;
  if (!esAutor && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este comentario');
  }

  // todo en una transacción: el conteo de respuestas y el borrado ven lo mismo
  return prisma.$transaction(async (tx) => {
    const cantidadRespuestas = await tx.comentario.count({
      where: { padre_id: comentario_id },
    });

    // borrado real: solo el autor, y solo si nadie respondió
    if (esAutor && cantidadRespuestas === 0) {
      await eliminarInteracciones(tx, 'comentario', [comentario_id]);
      await tx.comentario.delete({ where: { id: comentario_id } });
      const podados = await podarAncestrosEliminados(tx, comentario.padre_id);
      return {
        eliminado_permanente: true,
        comentario: null,
        ids_eliminados: [comentario_id, ...podados],
      };
    }

    // borrado lógico: queda como fantasma para no romper el hilo.
    // El autor vacía su texto; si modera el staff, el texto se conserva como
    // evidencia (el cliente nunca lo recibe, ver formatearComentario).
    await tx.guardado.deleteMany({
      where: { tipo_contenido: 'comentario', contenido_id: comentario_id },
    });
    const actualizado = await tx.comentario.update({
      where: { id: comentario_id },
      data: {
        eliminado: true,
        eliminado_por_id: usuario_id,
        eliminado_en: new Date(),
        ...(esAutor && { contenido: '' }),
      },
      include: INCLUDE_AUTOR,
    });
    return {
      eliminado_permanente: false,
      comentario: formatearComentario(actualizado),
      ids_eliminados: [],
    };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Sube por la cadena de padres borrando los fantasmas que quedaron sin respuestas.
// Solo poda los que eliminó su propio autor (los de moderación se conservan).
// Devuelve los ids borrados para que el cliente los saque del árbol.
async function podarAncestrosEliminados(tx, padre_id) {
  const podados = [];
  let actualId = padre_id;

  while (actualId) {
    const padre = await tx.comentario.findUnique({
      where: { id: actualId },
      select: {
        id: true,
        autor_id: true,
        eliminado: true,
        eliminado_por_id: true,
        padre_id: true,
        _count: { select: { respuestas: true } },
      },
    });

    const podable =
      padre &&
      padre.eliminado &&
      padre._count.respuestas === 0 &&
      (!padre.eliminado_por_id || padre.eliminado_por_id === padre.autor_id);
    if (!podable) break;

    await eliminarInteracciones(tx, 'comentario', [padre.id]);
    await tx.comentario.delete({ where: { id: padre.id } });
    podados.push(padre.id);
    actualId = padre.padre_id;
  }
  return podados;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarComentariosGuardados(ids, usuario_id) {
  const comentarios = await prisma.comentario.findMany({
    where: { id: { in: ids } },
    include: INCLUDE_AUTOR,
  });

  const mapComentarios = Object.fromEntries(comentarios.map((c) => [c.id, c]));

  const { mapVotos } = await obtenerMisInteracciones(
    'comentario',
    ids,
    usuario_id,
  );

  // agrupa los ids por el tipo de contenido al que pertenece cada comentario
  const idsPorTipo = new Map();
  for (const c of comentarios) {
    if (!idsPorTipo.has(c.tipo_contenido)) {
      idsPorTipo.set(c.tipo_contenido, new Set());
    }
    idsPorTipo.get(c.tipo_contenido).add(c.contenido_id);
  }

  // "tipo:id" -> título (o el campo previewField que defina el registro)
  const previews = new Map();
  for (const [tipo, setIds] of idsPorTipo) {
    const mapa = await obtenerPreviewsContenido(tipo, [...setIds]);
    for (const [id, titulo] of mapa) previews.set(`${tipo}:${id}`, titulo);
  }

  return ids
    .filter((id) => mapComentarios[id])
    .map((id) => {
      const c = mapComentarios[id];
      const clave = `${c.tipo_contenido}:${c.contenido_id}`;
      return {
        ...formatearComentario(c, {
          mi_voto: mapVotos.get(id) ?? null,
          esta_guardado: true,
        }),
        contenido_padre: previews.has(clave)
          ? {
              tipo_contenido: c.tipo_contenido,
              id: c.contenido_id,
              titulo: previews.get(clave),
            }
          : null,
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
      tipo_contenido: 'comentario',
      contenido: null,
      votos_neto: comentario.votos_neto,
      mi_voto: null,
      esta_guardado,
      nivel: comentario.nivel,
      creado_en: comentario.creado_en,
      editado_en: null, // un comentario eliminado no muestra "(editado)"
      eliminado: true,
      eliminado_por:
        comentario.eliminado_por_id &&
        comentario.eliminado_por_id !== comentario.autor_id
          ? 'moderacion'
          : 'autor',
      autor: null,
    };
  }

  return {
    id: comentario.id,
    tipo_contenido: 'comentario',
    contenido: comentario.contenido,
    votos_neto: comentario.votos_neto,
    mi_voto,
    esta_guardado,
    nivel: comentario.nivel,
    creado_en: comentario.creado_en,
    editado_en: comentario.editado_en,
    eliminado: false,
    eliminado_por: null,
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
