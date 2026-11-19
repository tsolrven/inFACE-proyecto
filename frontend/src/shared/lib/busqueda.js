import { normalizarHashtag } from '@/shared/lib/hashtags';

// Deben coincidir con backend/src/shared/search/busqueda.validation.js
export const BUSQUEDA_MIN = 2;
export const BUSQUEDA_MAX = 100;
export const BUSQUEDA_RETARDO_MS = 300;

// Lo que vale la pena enviar al backend: el texto recortado, o '' si es más
// corto que el mínimo (en "#calc" se mide lo que va después del #, igual que
// interpretarBusqueda del backend). Así no se dispara una petición por "a" o "#".
// opciones: min (mínimo de caracteres) y hashtags (si "#" significa búsqueda
// por hashtag; en la búsqueda de usuarios no, porque no tienen hashtags)
export function busquedaEfectiva(
  texto = '',
  { min = BUSQUEDA_MIN, hashtags = true } = {},
) {
  const valor = texto.trim();
  const termino =
    hashtags && valor.startsWith('#') ? normalizarHashtag(valor) : valor;
  return termino.length >= min ? valor : '';
}