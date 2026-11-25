export const COMENTARIO_MAX = 2000; // debe coincidir con comments.validation.js
export const COMENTARIO_MAX_NIVEL = 10; // debe coincidir con comments.constants.js

export const COMENTARIO_ORDENES = [
  { valor: 'mejores', label: 'Mejores' },
  { valor: 'nuevos', label: 'Nuevos' },
  { valor: 'antiguos', label: 'Antiguos' },
];

// Deben coincidir con el backend: contentRegistry.js (comentario.adjuntos) y
// comments.constants.js (TIPOS_SIN_IMAGEN)
export const IMAGEN_COMENTARIO = {
  maxBytes: 5 * 1024 * 1024,
  extensiones: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};
export const TIPOS_SIN_IMAGEN = ['parrafo'];
