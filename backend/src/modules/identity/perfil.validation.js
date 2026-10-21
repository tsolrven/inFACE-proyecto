import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
const actualizarPerfilSchema = z.object({
    nombre_usuario: z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede superar 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos')
        .optional(),

    biografia: z
        .string()
        .max(280, 'La biografía no puede superar 280 caracteres')
        .optional()
        .nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
const actualizarEtiquetasSchema = z.object({
    etiqueta_ids: z
        .array(z.string().uuid('Etiqueta inválida'))
        .max(15, 'Puedes seleccionar como máximo 15 intereses'),
});

// ─────────────────────────────────────────────────────────────────────────────
export { actualizarPerfilSchema, actualizarEtiquetasSchema };