import { z } from 'zod';
import { ACCESORIOS_IDS } from './avatar.constants.js';
import {
  NOMBRE_USUARIO_REGEX,
  NOMBRE_USUARIO_MENSAJE,
  NOMBRE_COMPLETO_REGEX,
} from './patrones.js';

// ─────────────────────────────────────────────────────────────────────────────
const actualizarPerfilSchema = z.object({
  nombre_usuario: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede superar 30 caracteres')
    .regex(NOMBRE_USUARIO_REGEX, NOMBRE_USUARIO_MENSAJE)
    .optional(),

  nombre_completo: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre no puede superar 80 caracteres')
    .regex(NOMBRE_COMPLETO_REGEX, 'El nombre solo puede tener letras y espacios')
    .optional(),

  biografia: z
    .string()
    .max(280, 'La biografía no puede superar 280 caracteres')
    .optional()
    .nullable(),

  avatar: z
    .object({
      accesorios: z
        .array(z.enum(ACCESORIOS_IDS, { error: 'Accesorio inválido' }))
        .max(ACCESORIOS_IDS.length),
    })
    .nullable()
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
const actualizarEtiquetasSchema = z.object({
  etiqueta_ids: z
    .array(z.string().uuid('Etiqueta inválida'))
    .max(15, 'Puedes seleccionar como máximo 15 intereses'),
});

// ─────────────────────────────────────────────────────────────────────────────
export { actualizarPerfilSchema, actualizarEtiquetasSchema };