import { prisma } from '../../config/configDb.js';
import { BadRequestError } from '../../errors/appError.js';
import { obtenerConfigEstadisticas } from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const TOP_LIMITE = 5;
const TAGS_LIMITE = 10;
// ────────────────────────────────────────────────────────────────────────────────────────
// Suma los votos_neto que recibió cada usuario en sus publicaciones de este
// módulo + sus comentarios en ellas, solo dentro de la carrera indicada.
async function obtenerTopColaboradores(tipo_contenido, carrera_id) {
  const config = obtenerConfigEstadisticas(tipo_contenido);
  if (!config.topColaboradores) {
    throw new BadRequestError('Este módulo no tiene top colaboradores');
  }
  if (!carrera_id) return [];

  const publicaciones = await config.modelo.findMany({
    where: config.whereCarrera(carrera_id),
    select: { id: true },
  });
  const ids = publicaciones.map((p) => p.id);
  if (ids.length === 0) return [];

  const [porPublicaciones, porComentarios] = await Promise.all([
    config.modelo.groupBy({
      by: ['autor_id'],
      where: { id: { in: ids } },
      _sum: { votos_neto: true },
    }),
    prisma.comentario.groupBy({
      by: ['autor_id'],
      where: {
        tipo_contenido,
        contenido_id: { in: ids },
        eliminado: false,
      },
      _sum: { votos_neto: true },
    }),
  ]);

  const totales = {};
  for (const { autor_id, _sum } of [...porPublicaciones, ...porComentarios]) {
    totales[autor_id] = (totales[autor_id] || 0) + (_sum.votos_neto || 0);
  }

  const ranking = Object.entries(totales)
    .map(([autor_id, puntos]) => ({ autor_id, puntos }))
    .filter((r) => r.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, TOP_LIMITE);

  if (ranking.length === 0) return [];

  const perfiles = await prisma.perfil.findMany({
    where: { usuario_id: { in: ranking.map((r) => r.autor_id) } },
    select: { usuario_id: true, nombre_usuario: true },
  });
  const mapPerfiles = Object.fromEntries(
    perfiles.map((p) => [p.usuario_id, p.nombre_usuario]),
  );

  return ranking.map((r) => ({
    usuario_id: r.autor_id,
    nombre_usuario: mapPerfiles[r.autor_id] || 'usuario',
    puntos: r.puntos,
  }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Hashtags más usados en publicaciones de este módulo y carrera, dentro de la
// ventana del módulo (diasTags). Devuelve la ventana para que el frontend la
// muestre sin repetir la configuración.
async function obtenerHashtagsPopulares(tipo_contenido, carrera_id) {
  const { hashtags, whereCarrera, diasTags } =
    obtenerConfigEstadisticas(tipo_contenido);
  if (!carrera_id) return { dias: diasTags, hashtags: [] };

  const desde = new Date();
  desde.setDate(desde.getDate() - diasTags);

  const agrupado = await hashtags.modelo.groupBy({
    by: ['hashtag_id'],
    where: {
      [hashtags.relacion]: {
        creado_en: { gte: desde },
        ...whereCarrera(carrera_id),
      },
    },
    _count: { hashtag_id: true },
    orderBy: { _count: { hashtag_id: 'desc' } },
    take: TAGS_LIMITE,
  });

  if (agrupado.length === 0) return { dias: diasTags, hashtags: [] };

  const encontrados = await prisma.hashtag.findMany({
    where: { id: { in: agrupado.map((a) => a.hashtag_id) } },
    select: { id: true, nombre: true },
  });
  const mapNombres = Object.fromEntries(
    encontrados.map((h) => [h.id, h.nombre]),
  );

  return {
    dias: diasTags,
    hashtags: agrupado
      .map((a) => ({
        nombre: mapNombres[a.hashtag_id],
        usos: a._count.hashtag_id,
      }))
      .filter((t) => t.nombre),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { obtenerTopColaboradores, obtenerHashtagsPopulares };