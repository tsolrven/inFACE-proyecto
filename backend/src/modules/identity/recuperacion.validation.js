import { z } from 'zod';

const olvideContrasenaSchema = z.object({
  correo: z
    .string({ error: 'Escribe tu correo institucional' })
    .trim()
    .toLowerCase()
    .email('Escribe un correo válido'),
});

const restablecerContrasenaSchema = z.object({
  token: z.string().min(20, 'El enlace no es válido').max(200),
  nueva: z
    .string({ error: 'Escribe tu contraseña nueva' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe incluir una mayúscula, una minúscula y un número',
    ),
});

export { olvideContrasenaSchema, restablecerContrasenaSchema };
