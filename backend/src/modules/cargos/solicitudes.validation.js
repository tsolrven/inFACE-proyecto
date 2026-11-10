import { z } from 'zod';
import { TIPOS_CARGO } from '../../shared/auth/cargos.js';
import { MENSAJE_MIN, MENSAJE_MAX } from './solicitudes.constants.js';

const crearSolicitudSchema = z.object({
  tipo: z.enum(Object.values(TIPOS_CARGO), {
    error: 'El tipo de cargo no es válido',
  }),
  carrera_id: z
    .string({ error: 'La carrera es requerida' })
    .uuid('La carrera seleccionada no es válida'),
  mensaje: z
    .string({ error: 'El mensaje es requerido' })
    .trim()
    .min(
      MENSAJE_MIN,
      `El mensaje debe tener al menos ${MENSAJE_MIN} caracteres`,
    )
    .max(MENSAJE_MAX, `El mensaje no puede superar ${MENSAJE_MAX} caracteres`),
});

export { crearSolicitudSchema };