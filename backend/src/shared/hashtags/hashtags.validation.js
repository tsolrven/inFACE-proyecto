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
// Hashtags que escribe el autor al crear/editar un contenido.
const hashtagsSchema = z
  .array(
    z
      .string()
      .trim()
      .toLowerCase()
      .transform((tag) => tag.replace(/^#+/, ''))
      .pipe(
        z
          .string()
          .min(1)
          .max(MAX_LARGO_HASHTAG, ERROR_MESSAGES.max_largo)
          .regex(/^[a-zA-Z0-9_]+$/, ERROR_MESSAGES.pattern),
      ),
  )
  .max(MAX_HASHTAGS, ERROR_MESSAGES.max_cantidad)
  .transform((tags) => [...new Set(tags)])
  .optional();
// ─────────────────────────────────────────────────────────────────────────────
// Hashtag que llega en el query de un listado (?hashtag=calculo).
const hashtagFiltroSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(MAX_LARGO_HASHTAG, ERROR_MESSAGES.filtro_largo);
// ─────────────────────────────────────────────────────────────────────────────
export { MAX_HASHTAGS, MAX_LARGO_HASHTAG, hashtagsSchema, hashtagFiltroSchema };
