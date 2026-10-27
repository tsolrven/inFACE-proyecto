// Deben coincidir con backend/src/modules/forum/forum.validation.js
export const TITULO_MIN = 3;
export const TITULO_MAX = 150;
export const CONTENIDO_MAX = 10000; // se mide sobre el markdown serializado
export const ADJUNTOS_MAX = 10; // contentRegistry: hilo.adjuntos.max
export const ADJUNTOS_EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
