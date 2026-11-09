import { z } from 'zod';
import dns from 'node:dns/promises';
import { CARGOS } from './avatar.constants.js';
import {
  NOMBRE_USUARIO_REGEX,
  NOMBRE_USUARIO_MENSAJE,
  NOMBRE_COMPLETO_REGEX,
} from './patrones.js';
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
    pattern: NOMBRE_USUARIO_MENSAJE,
    required: 'El nombre de usuario es requerido',
  },
  carrera: {
    invalid: 'Selecciona una carrera válida',
    required: 'Debes seleccionar tu carrera',
  },
  nombreCompleto: {
    required: 'Debes ingresar tu nombre completo',
    min: 'El nombre debe tener al menos 3 caracteres',
    max: 'El nombre no puede superar 80 caracteres',
    pattern: 'El nombre solo puede tener letras y espacios',
  },
  cargo: {
    invalid: 'Selecciona un cargo válido',
    required: 'Debes seleccionar tu cargo',
  },

  terminos: {
    required:
      'Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const DOMINIOS_PERMITIDOS = ['@alumnos.ubiobio.cl', '@ubiobio.cl'];
// ─────────────────────────────────────────────────────────────────────────────
const cacheDominiosVerificados = new Map(); // evita repetir la consulta DNS en cada request

async function dominioTieneCorreo(email) {
  const dominio = email.split('@')[1];
  if (!dominio) return false;
  if (cacheDominiosVerificados.has(dominio))
    return cacheDominiosVerificados.get(dominio);

  try {
    const registros = await dns.resolveMx(dominio);
    const tieneMx = Array.isArray(registros) && registros.length > 0;
    cacheDominiosVerificados.set(dominio, tieneMx);
    return tieneMx;
  } catch {
    return true;
  }
}
// ─────────────────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  correo: z
    .string({ error: ERROR_MESSAGES.email.required })
    .trim()
    .toLowerCase()
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
    .string({ error: ERROR_MESSAGES.password.required })
    .min(8, ERROR_MESSAGES.password.min)
    .max(100, ERROR_MESSAGES.password.max)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, ERROR_MESSAGES.password.pattern),

  nombre_usuario: z
    .string({ error: ERROR_MESSAGES.username.required })
    .min(3, ERROR_MESSAGES.username.min)
    .max(30, ERROR_MESSAGES.username.max)
    .regex(NOMBRE_USUARIO_REGEX, ERROR_MESSAGES.username.pattern),

  carrera_id: z
    .string({ error: ERROR_MESSAGES.carrera.required })
    .uuid(ERROR_MESSAGES.carrera.invalid)
    .optional(),

  nombre_completo: z
    .string()
    .trim()
    .min(3, ERROR_MESSAGES.nombreCompleto.min)
    .max(80, ERROR_MESSAGES.nombreCompleto.max)
    .regex(NOMBRE_COMPLETO_REGEX, ERROR_MESSAGES.nombreCompleto.pattern)
    .optional(),

  cargo: z.enum(CARGOS, { error: ERROR_MESSAGES.cargo.invalid }).optional(),

  etiqueta_ids: z
    .array(z.string().uuid('Etiqueta inválida'))
    .max(15, 'Puedes seleccionar como máximo 15 intereses')
    .optional()
    .default([]),

  acepta_terminos: z.literal(true, { error: ERROR_MESSAGES.terminos.required }),

  acepta_investigacion: z.boolean().optional().default(false),
}).superRefine((datos, ctx) => {
  const esAcademico = datos.correo.endsWith('@ubiobio.cl');
  if (esAcademico) {
    if (!datos.nombre_completo) {
      ctx.addIssue({
        code: 'custom',
        path: ['nombre_completo'],
        message: ERROR_MESSAGES.nombreCompleto.required,
      });
    }
    if (!datos.cargo) {
      ctx.addIssue({
        code: 'custom',
        path: ['cargo'],
        message: ERROR_MESSAGES.cargo.required,
      });
    }
  } else if (!datos.carrera_id) {
    ctx.addIssue({
      code: 'custom',
      path: ['carrera_id'],
      message: ERROR_MESSAGES.carrera.required,
    });
  }
});

const aceptarTerminosSchema = z.object({
  acepta_terminos: z.literal(true, { error: ERROR_MESSAGES.terminos.required }),
  acepta_investigacion: z.boolean().optional().default(false),
});
// ─────────────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  correo: z
    .string({ error: ERROR_MESSAGES.email.required })
    .trim()
    .toLowerCase()
    .email(ERROR_MESSAGES.email.invalid),

  contrasena: z
    .string({ error: ERROR_MESSAGES.password.required })
    .min(1, ERROR_MESSAGES.password.required),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  registerSchema,
  loginSchema,
  DOMINIOS_PERMITIDOS,
  aceptarTerminosSchema,
};