//! datos "del usuario sobre el contenido" que acompañan a cada post en las listas:
//! mi voto, si lo guardé, cuántos comentarios tiene y sus archivos.
//! Funciona para cualquier tipo de contenido porque las tablas son polimórficas.

import { prisma } from '../../config/configDb.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// Mi voto y mi guardado sobre una lista de contenidos del mismo tipo.
async function obtenerMisInteracciones(tipo_contenido, ids, usuario_id) {
  if (!usuario_id || ids.length === 0) {
    return { mapVotos: new Map(), setGuardados: new Set() };
  }

  const where = { usuario_id, tipo_contenido, contenido_id: { in: ids } };

  const [votos, guardados] = await Promise.all([
    prisma.voto.findMany({
      where,
      select: { contenido_id: true, tipo: true },
    }),
    prisma.guardado.findMany({ where, select: { contenido_id: true } }),
  ]);

  return {
    mapVotos: new Map(votos.map((v) => [v.contenido_id, v.tipo])),
    setGuardados: new Set(guardados.map((g) => g.contenido_id)),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cantidad de comentarios visibles (no eliminados) por contenido.
async function contarComentarios(tipo_contenido, ids) {
  if (ids.length === 0) return new Map();

  const conteo = await prisma.comentario.groupBy({
    by: ['contenido_id'],
    where: { tipo_contenido, contenido_id: { in: ids }, eliminado: false },
    _count: { _all: true },
  });

  return new Map(conteo.map((c) => [c.contenido_id, c._count._all]));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Archivos adjuntos agrupados por contenido.
async function obtenerArchivos(tipo_contenido, ids) {
  if (ids.length === 0) return new Map();

  const archivos = await prisma.archivo.findMany({
    where: { tipo_contenido, contenido_id: { in: ids } },
  });

  const mapa = new Map();
  for (const archivo of archivos) {
    if (!mapa.has(archivo.contenido_id)) mapa.set(archivo.contenido_id, []);
    mapa.get(archivo.contenido_id).push(archivo);
  }
  return mapa;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Todo junto, en paralelo. Es lo que usan los posts (apunte hoy; hilo y anuncio mañana).
async function obtenerEnriquecimiento(tipo_contenido, ids, usuario_id) {
  const [interacciones, mapComentarios, mapArchivos] = await Promise.all([
    obtenerMisInteracciones(tipo_contenido, ids, usuario_id),
    contarComentarios(tipo_contenido, ids),
    obtenerArchivos(tipo_contenido, ids),
  ]);

  return { ...interacciones, mapComentarios, mapArchivos };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  obtenerMisInteracciones,
  contarComentarios,
  obtenerArchivos,
  obtenerEnriquecimiento,
};
