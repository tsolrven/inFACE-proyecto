import { z } from 'zod';
import {
  tiposContenidoValidos,
  admiteComentarios,
} from '../content/contentRegistry.js';
import { paginacionQuerySchema } from '../validation/common.schemas.js';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  tipo: {
    invalid: 'Tipo de contenido inválido',
  },
  padre: {
    invalid: 'Tipo de contenido padre inválido',
    solo_comentarios: 'El filtro "padre" solo aplica a tipo=comentario',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
// `padre`: tipo de contenido al que pertenece el comentario guardado (apunte, hilo…).
// Solo tiene sentido con tipo=comentario.
const listarGuardadosQuerySchema = paginacionQuerySchema
  .extend({
    tipo: z
      .string()
      .refine(
        (tipo) => tiposContenidoValidos().includes(tipo),
        ERROR_MESSAGES.tipo.invalid,
      )
      .optional(),
    padre: z
      .string()
      .refine((padre) => admiteComentarios(padre), ERROR_MESSAGES.padre.invalid)
      .optional(),
  })
  .refine((query) => !query.padre || query.tipo === 'comentario', {
    message: ERROR_MESSAGES.padre.solo_comentarios,
    path: ['padre'],
  });
// ─────────────────────────────────────────────────────────────────────────────
export { listarGuardadosQuerySchema };
