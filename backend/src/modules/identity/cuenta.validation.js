import { z } from 'zod';

const cambiarContrasenaSchema = z.object({
  actual: z.string().min(1, 'Escribe tu contraseña actual'),
  nueva: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe incluir una mayúscula, una minúscula y un número',
    ),
});

const consentimientoSchema = z.object({
  consentimiento_investigacion: z.boolean(),
});

export { cambiarContrasenaSchema, consentimientoSchema };
