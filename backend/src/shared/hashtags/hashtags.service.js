import { prisma } from '../../config/configDb.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// Sirve para cualquier modelo con relación `hashtags` -> tabla puente con `hashtag`
// (ApunteHashtag hoy, HiloHashtag mañana).
const INCLUDE_HASHTAGS = {
  include: { hashtag: { select: { nombre: true } } },
};
// ────────────────────────────────────────────────────────────────────────────────────────
// Crea en el catálogo global los hashtags que no existen y devuelve las filas
// puente listas para `hashtags: { create: ... }`.
// Llamar ANTES de abrir la transacción (un upsert fallido dentro de una
// transacción de Postgres la deja abortada).
async function resolverHashtags(hashtags, client = prisma) {
  return Promise.all(
    hashtags.map(async (nombre) => {
      const tag = await client.hashtag.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      });
      return { hashtag_id: tag.id };
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Valor para `where.hashtags` de un listado filtrado por hashtag.
function filtroPorHashtag(nombre) {
  return { some: { hashtag: { nombre } } };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Para la barra de búsqueda: "#calc" encuentra #calculo, #calculo_ii...
// `prefijo` ya viene normalizado (interpretarBusqueda -> normalizarHashtag)
function filtroPorPrefijoHashtag(prefijo) {
  return { some: { hashtag: { nombre: { startsWith: prefijo } } } };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Filas puente (con INCLUDE_HASHTAGS) -> ['calculo', 'algebra']
function nombresDeHashtags(filas) {
  return filas.map((h) => h.hashtag.nombre);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  INCLUDE_HASHTAGS,
  resolverHashtags,
  filtroPorHashtag,
  filtroPorPrefijoHashtag,
  nombresDeHashtags,
};
