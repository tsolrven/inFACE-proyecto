import { prisma } from '../config/configDb.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// suma los votos_neto que ha recibido cada usuario en sus apuntes + comentarios,
// pero solo contenido que vive dentro del repositorio de materiales de SU carrera.
async function obtenerTopColaboradores(carrera_id, limite = 5) {
  if (!carrera_id) return [];

  // apuntes que pertenecen a ramos de esta carrera (los necesitamos para
  // acotar tanto el conteo de apuntes como el de comentarios, ya que
  // Comentario no tiene una relación directa con Ramo/Carrera)
  const apuntesDeLaCarrera = await prisma.apunte.findMany({
    where: { ramo: { ramo_carrera: { some: { carrera_id } } } },
    select: { id: true },
  });
  const apunteIds = apuntesDeLaCarrera.map((a) => a.id);

  const [puntosPorApuntes, puntosPorComentarios] = await Promise.all([
    prisma.apunte.groupBy({
      by: ['autor_id'],
      where: { id: { in: apunteIds } },
      _sum: { votos_neto: true },
    }),
    apunteIds.length
      ? prisma.comentario.groupBy({
          by: ['autor_id'],
          where: {
            tipo_contenido: 'apunte',
            contenido_id: { in: apunteIds },
            eliminado: false,
          },
          _sum: { votos_neto: true },
        })
      : Promise.resolve([]),
  ]);

  const totales = {};
  for (const { autor_id, _sum } of puntosPorApuntes) {
    totales[autor_id] = (totales[autor_id] || 0) + (_sum.votos_neto || 0);
  }
  for (const { autor_id, _sum } of puntosPorComentarios) {
    totales[autor_id] = (totales[autor_id] || 0) + (_sum.votos_neto || 0);
  }

  const ranking = Object.entries(totales)
    .map(([autor_id, puntos]) => ({ autor_id, puntos }))
    .filter((r) => r.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, limite);

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
// hashtags más usados en apuntes de la carrera del usuario, en los últimos 30 días.
async function obtenerHashtagsPopulares(carrera_id, limite = 10) {
  if (!carrera_id) return [];

  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  const agrupado = await prisma.apunteHashtag.groupBy({
    by: ['hashtag_id'],
    where: {
      apunte: {
        creado_en: { gte: desde },
        ramo: { ramo_carrera: { some: { carrera_id } } },
      },
    },
    _count: { hashtag_id: true },
    orderBy: { _count: { hashtag_id: 'desc' } },
    take: limite,
  });

  if (agrupado.length === 0) return [];

  const hashtags = await prisma.hashtag.findMany({
    where: { id: { in: agrupado.map((a) => a.hashtag_id) } },
    select: { id: true, nombre: true },
  });
  const mapNombres = Object.fromEntries(hashtags.map((h) => [h.id, h.nombre]));

  return agrupado
    .map((a) => ({
      nombre: mapNombres[a.hashtag_id],
      usos: a._count.hashtag_id,
    }))
    .filter((t) => t.nombre);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { obtenerTopColaboradores, obtenerHashtagsPopulares };
