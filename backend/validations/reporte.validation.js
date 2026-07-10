import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Motivos válidos para un reporte. Compartido conceptualmente con el frontend
// (frontend/src/constants/reportMotivos.js) — si agregas un motivo nuevo acá,
// agrégalo también allá (label + descripción para el modal).
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

// motivos que requieren el campo "detalle" con contenido (no solo opcional)
const MOTIVOS_QUE_REQUIEREN_DETALLE = ['otro'];

// motivos que requieren el campo "objetivo" (ej. acoso: ¿hacia quién es?)
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
  apunte_id: {
    invalid: 'El id del apunte no es válido',
  },
  comentario_id: {
    invalid: 'El id del comentario no es válido',
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
const apunteIdParamSchema = z.object({
  apunte_id: z.string().uuid(ERROR_MESSAGES.apunte_id.invalid),
});

const comentarioIdParamSchema = z.object({
  comentario_id: z.string().uuid(ERROR_MESSAGES.comentario_id.invalid),
});

// ─────────────────────────────────────────────────────────────────────────────
export {
  crearReporteSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
  MOTIVOS_REPORTE,
};
