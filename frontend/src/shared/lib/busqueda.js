import { normalizarHashtag } from '@/shared/lib/hashtags';

// Deben coincidir con backend/src/shared/search/busqueda.validation.js
export const BUSQUEDA_MIN = 2;
export const BUSQUEDA_MAX = 100;
export const BUSQUEDA_RETARDO_MS = 300;

// Lo que vale la pena enviar al backend: el texto recortado, o '' si es más
// corto que el mínimo (en "#calc" se mide lo que va después del #, igual que
// interpretarBusqueda del backend). Así no se dispara una petición por "a" o "#".
export function busquedaEfectiva(texto = '') {
  const valor = texto.trim();
  const termino = valor.startsWith('#') ? normalizarHashtag(valor) : valor;
  return termino.length >= BUSQUEDA_MIN ? valor : '';
}