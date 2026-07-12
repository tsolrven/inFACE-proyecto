import { prisma } from '../config/configDb.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
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

  return construirArbolComentarios(comentarios, mapVotos);
}

function construirArbolComentarios(comentarios, mapVotos = {}) {
  const nodosPorId = new Map();
  const raices = [];

  for (const c of comentarios) {
    nodosPorId.set(c.id, {
      ...formatearComentario(c, { mi_voto: mapVotos[c.id] || null }),
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
    if (nivel > 2) {
      throw new BadRequestError('No se permiten más de 3 niveles de respuesta');
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
function formatearComentario(comentario, { mi_voto = null } = {}) {
  return {
    id: comentario.id,
    contenido: comentario.contenido,
    votos_neto: comentario.votos_neto,
    mi_voto,
    nivel: comentario.nivel,
    creado_en: comentario.creado_en,
    autor: {
      id: comentario.autor.id,
      nombre_usuario: comentario.autor.perfil?.nombre_usuario,
    },
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarComentarios, crearComentario };
