import { z } from 'zod';
import { tiposContenidoValidos } from '../content/contentRegistry.js';
// ─────────────────────────────────────────────────────────────────────────────
// Schemas de parámetros de ruta compartidos por todos los módulos.
const apunteIdParamSchema = z.object({
  apunte_id: z.string().uuid('El id del apunte no es válido'),
});

const comentarioIdParamSchema = z.object({
  comentario_id: z.string().uuid('El id del comentario no es válido'),
});

const idParamSchema = z.object({
  id: z.string().uuid('El id no es válido'),
});

// Para rutas genéricas /:tipo/:id (votos, guardados, reportes).
// El tipo se valida contra el registry: agregar un contenido nuevo allá basta.
const contenidoParamSchema = z.object({
  tipo: z
    .string()
    .refine(
      (tipo) => tiposContenidoValidos().includes(tipo),
      'Tipo de contenido inválido',
    ),
  id: z.string().uuid('El id no es válido'),
});
// ─────────────────────────────────────────────────────────────────────────────
// Paginación compartida por todos los listados.
// Convierte los strings de la URL a número y pone tope al tamaño de página.
const paginacionQuerySchema = z.object({
  pagina: z.coerce
    .number({ error: 'La página debe ser un número' })
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser mayor o igual a 1')
    .default(1),
  limite: z.coerce
    .number({ error: 'El límite debe ser un número' })
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser mayor o igual a 1')
    .max(50, 'El límite no puede superar 50')
    .default(20),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  apunteIdParamSchema,
  comentarioIdParamSchema,
  idParamSchema,
  contenidoParamSchema,
  paginacionQuerySchema,
};
