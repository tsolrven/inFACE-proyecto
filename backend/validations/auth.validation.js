import { z } from 'zod';
import dns from 'node:dns/promises';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  email: {
    invalid: 'El formato del correo no es válido',
    required: 'El correo es requerido',
    domain:
      'Solo se permiten correos institucionales: @alumnos.ubiobio.cl o @ubiobio.cl',
    noRecibeCorreo:
      'No se pudo confirmar que el dominio de ese correo reciba mensajes. Revisa que esté bien escrito.',
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
// Confirma que el DOMINIO del correo tenga servidores de correo (MX) reales.
// Esto NO confirma que la casilla específica exista (para eso hace falta mandar
// un correo real de verificación, lo que requiere credenciales de un servicio
// de envío que este proyecto todavía no tiene configurado) — pero sí descarta
// dominios mal escritos o inexistentes.
const cacheDominiosVerificados = new Map(); // evita repetir la consulta DNS en cada request

async function dominioTieneCorreo(email) {
  const dominio = email.split('@')[1];
  if (!dominio) return false;
  if (cacheDominiosVerificados.has(dominio)) return cacheDominiosVerificados.get(dominio);

  try {
    const registros = await dns.resolveMx(dominio);
    const tieneMx = Array.isArray(registros) && registros.length > 0;
    cacheDominiosVerificados.set(dominio, tieneMx);
    return tieneMx;
  } catch {
    // si falla la consulta DNS en sí (ej. sin acceso a internet en el server),
    // no se bloquea el registro por un problema nuestro, no del correo
    return true;
  }
}
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
    )
    .refine(dominioTieneCorreo, {
      message: ERROR_MESSAGES.email.noRecibeCorreo,
    }),

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
