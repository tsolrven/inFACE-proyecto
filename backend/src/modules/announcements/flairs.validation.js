import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const NOMBRE_MAX = 30; // debe coincidir con Flair.nombre @db.VarChar(30)

// Paleta fija: se guarda la clave; el frontend la traduce a clases de Tailwind.
// Debe coincidir con frontend/features/announcements/utils/flairColors.js
const COLORES_FLAIR = [
  'rojo',
  'naranja',
  'amarillo',
  'verde',
  'azul',
  'violeta',
  'rosa',
  'gris',
];

const ERROR_MESSAGES = {
  carrera: { invalid: 'La carrera seleccionada no es válida' },
  nombre: {
    required: 'El nombre es requerido',
    min: 'El nombre no puede estar vacío',
    max: `El nombre no puede superar ${NOMBRE_MAX} caracteres`,
  },
  color: { invalid: 'El color seleccionado no es válido' },
};
// ─────────────────────────────────────────────────────────────────────────────
// Forma canónica del nombre para la unicidad por carrera: sin espacios sobrantes,
// minúsculas y sin tildes, pero conservando la ñ (igual que los hashtags).
function normalizarNombreFlair(valor) {
  return valor
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/n\u0303/g, '\u00f1')
    .replace(/[\u0300-\u036f]/g, '');
}
// ─────────────────────────────────────────────────────────────────────────────
const nombreSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? ERROR_MESSAGES.nombre.required : undefined,
  })
  .transform((v) => v.trim().replace(/\s+/g, ' '))
  .pipe(
    z
      .string()
      .min(1, ERROR_MESSAGES.nombre.min)
      .max(NOMBRE_MAX, ERROR_MESSAGES.nombre.max),
  );

const colorSchema = z.enum(COLORES_FLAIR, {
  error: ERROR_MESSAGES.color.invalid,
});
// ─────────────────────────────────────────────────────────────────────────────
// La carrera no viaja en el body: es la del usuario.
const crearFlairSchema = z.object({
  nombre: nombreSchema,
  color: colorSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
// La carrera no se puede cambiar: z.object descarta `carrera_id` en el PATCH.
const actualizarFlairSchema = z.object({
  nombre: nombreSchema.optional(),
  color: colorSchema.optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
const listarFlairsQuerySchema = z.object({
  carrera_id: z.string().uuid(ERROR_MESSAGES.carrera.invalid).optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  NOMBRE_MAX,
  COLORES_FLAIR,
  normalizarNombreFlair,
  crearFlairSchema,
  actualizarFlairSchema,
  listarFlairsQuerySchema,
};
