import { prisma } from '../config/configDb.js';
import { BadRequestError, NotFoundError } from '../errors/appError.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarComentarios(apunte_id) {
  const comentarios = await prisma.comentario.findMany({
    where: {
      tipo_contenido: 'apunte',
      contenido_id: apunte_id,
      padre_id: null,
    },
    orderBy: { creado_en: 'asc' },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
      respuestas: {
        orderBy: { creado_en: 'asc' },
        include: {
          autor: { include: { perfil: { select: { nombre_usuario: true } } } },
        },
      },
    },
  });

  return comentarios.map(formatearComentario);
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
//* CON ESTA SOLO ME DA NIVEL 0 Y 1 DE COMENTARIOS
function formatearComentario(comentario) {
  return {
    id: comentario.id,
    contenido: comentario.contenido,
    votos_neto: comentario.votos_neto,
    nivel: comentario.nivel,
    creado_en: comentario.creado_en,
    autor: {
      id: comentario.autor.id,
      nombre_usuario: comentario.autor.perfil?.nombre_usuario,
    },
    respuestas: comentario.respuestas
      ? comentario.respuestas.map(formatearComentario)
      : [],
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarComentarios, crearComentario };
