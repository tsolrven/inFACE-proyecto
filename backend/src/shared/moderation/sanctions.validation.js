import { z } from 'zod';
import { tiposContenidoValidos } from '../content/contentRegistry.js';
import {
  TIPOS_SANCION,
  MOTIVO_MIN,
  MOTIVO_MAX,
  DIAS_MIN,
  DIAS_MAX,
} from './sanctions.constants.js';

function textoSchema(requerido) {
  return z
    .string({ error: requerido })
    .trim()
    .min(MOTIVO_MIN, `Debe tener al menos ${MOTIVO_MIN} caracteres`)
    .max(MOTIVO_MAX, `No puede superar ${MOTIVO_MAX} caracteres`);
}
// ─────────────────────────────────────────────────────────────────────────────
const crearSancionSchema = z
  .object({
    tipo: z.enum(Object.values(TIPOS_SANCION), {
      error: (issue) =>
        issue.input === undefined
          ? 'El tipo de sanción es requerido'
          : 'Tipo de sanción inválido',
    }),
    motivo: textoSchema('El motivo es requerido'),
    dias: z
      .number({ error: 'La duración debe ser un número de días' })
      .int('La duración debe ser un número entero de días')
      .min(DIAS_MIN, `La duración mínima es de ${DIAS_MIN} día`)
      .max(DIAS_MAX, `La duración máxima es de ${DIAS_MAX} días`)
      .optional(),
    permanente: z.boolean().optional(),
    contenido_tipo: z
      .string()
      .refine(
        (tipo) => tiposContenidoValidos().includes(tipo),
        'Tipo de contenido inválido',
      )
      .optional(),
    contenido_id: z.string().uuid('El id del contenido no es válido').optional(),
  })
  .superRefine((d, ctx) => {
    const error = (path, message) =>
      ctx.addIssue({ code: 'custom', path: [path], message });

    if (d.tipo === TIPOS_SANCION.ADVERTENCIA) {
      if (d.dias !== undefined || d.permanente) {
        error('dias', 'La advertencia no tiene duración');
      }
    } else if (d.permanente) {
      if (d.tipo !== TIPOS_SANCION.SUSPENSION) {
        error('permanente', 'Solo la suspensión puede ser permanente');
      }
      if (d.dias !== undefined) {
        error('dias', 'Una suspensión permanente no lleva duración en días');
      }
    } else if (d.dias === undefined) {
      error('dias', 'Indica la duración en días');
    }

    if (!!d.contenido_tipo !== !!d.contenido_id) {
      error('contenido_id', 'El contenido necesita tipo e id, o ninguno');
    }
  });
// ─────────────────────────────────────────────────────────────────────────────
// El body puede no venir (Express 5 deja req.body en undefined): default {}.
const revocarSancionSchema = z
  .object({
    motivo_revocacion: textoSchema('El motivo de revocación es requerido').optional(),
  })
  .default({});

const sancionParamSchema = z.object({
  id: z.string().uuid('El id del usuario no es válido'),
  sancionId: z.string().uuid('El id de la sanción no es válido'),
});

export { crearSancionSchema, revocarSancionSchema, sancionParamSchema };