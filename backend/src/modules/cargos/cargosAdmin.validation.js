import { z } from 'zod';
import { MOTIVO_MIN, MOTIVO_MAX } from './solicitudes.constants.js';

const revocarCargoSchema = z.object({
  motivo: z
    .string({ error: 'El motivo es requerido' })
    .trim()
    .min(MOTIVO_MIN, `El motivo debe tener al menos ${MOTIVO_MIN} caracteres`)
    .max(MOTIVO_MAX, `El motivo no puede superar ${MOTIVO_MAX} caracteres`),
});

export { revocarCargoSchema };