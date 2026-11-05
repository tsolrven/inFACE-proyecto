import { z } from 'zod';
import { paginacionQuerySchema } from '../validation/common.schemas.js';
import { tiposContenidoValidos } from '../content/contentRegistry.js';
// ─────────────────────────────────────────────────────────────────────────────
const MOTIVOS_REPORTE = [
  'spam',
  'acoso',
  'odio',
  'contenido_inapropiado',
  'plagio',
  'informacion_falsa',
  'fuera_de_lugar',
  'otro',
];

const MOTIVOS_QUE_REQUIEREN_DETALLE = ['otro'];

const MOTIVOS_QUE_REQUIEREN_OBJETIVO = ['acoso'];

const ERROR_MESSAGES = {
  motivo: {
    invalid: 'Motivo de reporte inválido',
    required: 'El motivo del reporte es requerido',
  },
  detalle: {
    max: 'El detalle no puede superar los 500 caracteres',
    required: 'Debes especificar el detalle cuando el motivo es "otro"',
  },
  objetivo: {
    invalid: 'El objetivo debe ser "propio" o "tercero"',
    required: 'Debes indicar hacia quién es el acoso',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const crearReporteSchema = z
  .object({
    motivo: z.enum(MOTIVOS_REPORTE, {
      error: (issue) =>
        issue.input === undefined
          ? ERROR_MESSAGES.motivo.required
          : ERROR_MESSAGES.motivo.invalid,
    }),
    detalle: z.string().max(500, ERROR_MESSAGES.detalle.max).trim().optional(),
    objetivo: z
      .enum(['propio', 'tercero'], ERROR_MESSAGES.objetivo.invalid)
      .optional(),
  })
  .refine(
    (data) =>
      !MOTIVOS_QUE_REQUIEREN_DETALLE.includes(data.motivo) ||
      (data.detalle && data.detalle.length > 0),
    {
      message: ERROR_MESSAGES.detalle.required,
      path: ['detalle'],
    },
  )
  .refine(
    (data) =>
      !MOTIVOS_QUE_REQUIEREN_OBJETIVO.includes(data.motivo) || !!data.objetivo,
    {
      message: ERROR_MESSAGES.objetivo.required,
      path: ['objetivo'],
    },
  );
// ─────────────────────────────────────────────────────────────────────────────
const RESULTADOS_CIERRE = ['resuelto', 'descartado', 'contenido_eliminado'];
const RESPUESTA_MIN = 5;
const RESPUESTA_MAX = 500; // coincide con Reporte.nota_resolucion (VarChar 500)

const listarReportesQuerySchema = paginacionQuerySchema.extend({
  vista: z
    .enum(['pendientes', 'historial'], { error: 'Vista inválida' })
    .default('pendientes'),
  tipo: z
    .string()
    .refine(
      (tipo) => tiposContenidoValidos().includes(tipo),
      'Tipo de contenido inválido',
    )
    .optional(),
});

const cerrarReporteSchema = z.object({
  resultado: z.enum(RESULTADOS_CIERRE, {
    error: (issue) =>
      issue.input === undefined
        ? 'El resultado del cierre es requerido'
        : 'Resultado de cierre inválido',
  }),
  respuesta: z.discriminatedUnion(
    'tipo',
    [
      z.object({ tipo: z.literal('predeterminada') }),
      z.object({
        tipo: z.literal('personalizada'),
        texto: z
          .string({ error: 'El mensaje personalizado es requerido' })
          .trim()
          .min(
            RESPUESTA_MIN,
            `El mensaje debe tener al menos ${RESPUESTA_MIN} caracteres`,
          )
          .max(
            RESPUESTA_MAX,
            `El mensaje no puede superar ${RESPUESTA_MAX} caracteres`,
          ),
      }),
    ],
    {
      error:
        'Debes elegir una respuesta predeterminada o escribir una personalizada',
    },
  ),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  crearReporteSchema,
  listarReportesQuerySchema,
  cerrarReporteSchema,
  MOTIVOS_REPORTE,
};
