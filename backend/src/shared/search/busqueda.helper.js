//! búsqueda compartida (listados y guardados de materiales, foro y anuncios):
//! - interpretarBusqueda: decide si es búsqueda por hashtag (#) o por texto
//! - condicionTexto: condición SQL "alguna columna contiene el texto", sin
//!   distinguir mayúsculas ni tildes, conservando la ñ (igual que los hashtags)
//! - restringirIds: suma un filtro por ids a un where de Prisma

import { Prisma } from '@prisma/client';
import { normalizarHashtag } from '../hashtags/hashtags.validation.js';
import { BUSQUEDA_MIN } from './busqueda.validation.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// Vocales con tilde, diéresis o acento grave -> sin marca. La ñ NO está:
// "año" y "ano" son palabras distintas (mismo criterio que normalizarHashtag).
const CON_TILDE = 'áéíóúüàèìòùÁÉÍÓÚÜÀÈÌÒÙ';
const SIN_TILDE = 'aeiouuaeiouAEIOUUAEIOU';

// Solo identificadores escritos en el código (ej. 'titulo', 'a.descripcion').
// Nunca debe llegar aquí texto del usuario: se insertan sin parámetro.
const IDENTIFICADOR_SQL = /^[a-z_]+(\.[a-z_]+)?$/;
// ────────────────────────────────────────────────────────────────────────────────────────
// '#calc' -> { tipo: 'hashtag', prefijo: 'calc' }
// 'Cálculo' -> { tipo: 'texto', texto: 'Cálculo' }
// vacío o más corto que BUSQUEDA_MIN -> null (no filtra)
function interpretarBusqueda(busqueda) {
  const valor = busqueda?.trim() ?? '';

  if (valor.startsWith('#')) {
    const prefijo = normalizarHashtag(valor); // quita '#', minúsculas, sin tildes
    return prefijo.length >= BUSQUEDA_MIN
      ? { tipo: 'hashtag', prefijo }
      : null;
  }

  return valor.length >= BUSQUEDA_MIN ? { tipo: 'texto', texto: valor } : null;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// mismo tratamiento a ambos lados de la comparación
function sinTildes(expr) {
  return Prisma.sql`lower(translate(${expr}, ${CON_TILDE}, ${SIN_TILDE}))`;
}

// % y _ son comodines de LIKE; \ es el carácter de escape
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

// (col1 LIKE '%texto%' OR col2 LIKE '%texto%' ...) sin mayúsculas ni tildes.
// Una columna NULL (ej. descripción vacía) simplemente no coincide.
function condicionTexto(columnas, texto) {
  const patron = sinTildes(`%${escaparLike(texto)}%`);

  const condiciones = columnas.map((columna) => {
    if (!IDENTIFICADOR_SQL.test(columna)) {
      throw new Error(`Identificador SQL inválido en búsqueda: ${columna}`);
    }
    return Prisma.sql`${sinTildes(Prisma.raw(columna))} LIKE ${patron} ESCAPE '\\'`;
  });

  return Prisma.sql`(${Prisma.join(condiciones, ' OR ')})`;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Suma una condición al AND de un where de Prisma sin pisar las existentes
// (ej. tipo_archivo y búsqueda filtran ambos por id; ?hashtag= y "#prefijo"
// filtran ambos por hashtags).
function restringirWhere(where, condicion) {
  where.AND = [...[].concat(where.AND ?? []), condicion];
}

function restringirIds(where, ids) {
  restringirWhere(where, { id: { in: ids } });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  interpretarBusqueda,
  condicionTexto,
  restringirWhere,
  restringirIds,
};