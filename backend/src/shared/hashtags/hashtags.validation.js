import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
// Reglas de hashtag compartidas por materiales y foro.
// Debe coincidir con frontend/src/shared/lib/hashtags.js
const MAX_HASHTAGS = 10;
const MAX_LARGO_HASHTAG = 30;

const ERROR_MESSAGES = {
  max_cantidad: `No puedes agregar más de ${MAX_HASHTAGS} hashtags`,
  pattern: 'Los hashtags solo pueden tener letras, números y guiones bajos',
  max_largo: `Cada hashtag no puede superar ${MAX_LARGO_HASHTAG} caracteres`,
  filtro_largo: 'El hashtag es demasiado largo',
};
// ─────────────────────────────────────────────────────────────────────────────
// Forma canónica de un hashtag: sin '#', en minúsculas y sin tildes, pero
// conservando la ñ (año y ano son palabras distintas).
// Debe dar el mismo resultado que normalizarHashtag de frontend/src/shared/lib/hashtags.js
function normalizarHashtag(valor) {
  return valor
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .normalize('NFD') // á -> a + marca; ñ -> n + marca
    .replace(/n\u0303/g, '\u00f1') // devuelve la ñ como un solo carácter
    .replace(/[\u0300-\u036f]/g, ''); // quita las demás marcas (tildes, diéresis)
}
// ─────────────────────────────────────────────────────────────────────────────
// Hashtags que escribe el autor al crear/editar un contenido.
const hashtagsSchema = z
  .array(
    z
      .string()
      .transform(normalizarHashtag)
      .pipe(
        z
          .string()
          .min(1)
          .max(MAX_LARGO_HASHTAG, ERROR_MESSAGES.max_largo)
          .regex(/^[a-z0-9_\u00f1]+$/, ERROR_MESSAGES.pattern),
      ),
  )
  .max(MAX_HASHTAGS, ERROR_MESSAGES.max_cantidad)
  .transform((tags) => [...new Set(tags)])
  .optional();
// ─────────────────────────────────────────────────────────────────────────────
// Hashtag que llega en el query de un listado (?hashtag=calculo).
const hashtagFiltroSchema = z
  .string()
  .transform(normalizarHashtag)
  .pipe(z.string().max(MAX_LARGO_HASHTAG, ERROR_MESSAGES.filtro_largo));
// ─────────────────────────────────────────────────────────────────────────────
export {
  MAX_HASHTAGS,
  MAX_LARGO_HASHTAG,
  hashtagsSchema,
  hashtagFiltroSchema,
  normalizarHashtag,
};
