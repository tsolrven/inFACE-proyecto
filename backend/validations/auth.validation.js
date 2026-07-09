import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  email: {
    invalid: 'El formato del correo no es válido',
    required: 'El correo es requerido',
    domain:
      'Solo se permiten correos institucionales: @alumnos.ubiobio.cl o @ubiobio.cl',
  },
  password: {
    min: 'La contraseña debe tener al menos 8 caracteres',
    max: 'La contraseña no puede tener más de 100 caracteres',
    pattern:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
    required: 'La contraseña es requerida',
  },
  username: {
    min: 'El nombre de usuario debe tener al menos 3 caracteres',
    max: 'El nombre de usuario no puede superar 30 caracteres',
    pattern: 'Solo letras, números y guiones bajos',
    required: 'El nombre de usuario es requerido',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const DOMINIOS_PERMITIDOS = ['@alumnos.ubiobio.cl', '@ubiobio.cl'];

const validarDominioInstitucional = (email) => {
  const tieneDominioPermitido = DOMINIOS_PERMITIDOS.some((dominio) =>
    email.endsWith(dominio),
  );

  if (!tieneDominioPermitido) {
    throw new z.ZodError([
      {
        path: ['correo'],
        message: ERROR_MESSAGES.email.domain,
      },
    ]);
  }

  return email;
};
// ─────────────────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  correo: z
    .string({ required_error: ERROR_MESSAGES.email.required })
    .email(ERROR_MESSAGES.email.invalid)
    .refine(
      (email) => {
        return DOMINIOS_PERMITIDOS.some((dominio) => email.endsWith(dominio));
      },
      {
        message: ERROR_MESSAGES.email.domain,
      },
    ),

  contrasena: z
    .string({ required_error: ERROR_MESSAGES.password.required })
    .min(8, ERROR_MESSAGES.password.min)
    .max(100, ERROR_MESSAGES.password.max)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, ERROR_MESSAGES.password.pattern),

  nombre_usuario: z
    .string({ required_error: ERROR_MESSAGES.username.required })
    .min(3, ERROR_MESSAGES.username.min)
    .max(30, ERROR_MESSAGES.username.max)
    .regex(/^[a-zA-Z0-9_]+$/, ERROR_MESSAGES.username.pattern),

  etiqueta_ids: z
    .array(z.string().uuid('Etiqueta inválida'))
    .max(15, 'Puedes seleccionar como máximo 15 intereses')
    .optional()
    .default([]),

});
// ─────────────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  correo: z
    .string({ required_error: ERROR_MESSAGES.email.required })
    .email(ERROR_MESSAGES.email.invalid),

  contrasena: z
    .string({ required_error: ERROR_MESSAGES.password.required })
    .min(1, ERROR_MESSAGES.password.required),
});
// ─────────────────────────────────────────────────────────────────────────────
export { registerSchema, loginSchema, DOMINIOS_PERMITIDOS };
