import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIAS = [
  'libros',
  'tecnologia',
  'hogar',
  'ropa',
  'deporte',
  'servicios',
  'otros',
];
const CONDICIONES = [
  'nuevo',
  'como_nuevo',
  'usado',
  'para_reparar',
  'servicio',
];
const UNIDADES_PRECIO = ['hora', 'clase', 'proyecto', 'total'];
const MODALIDADES = ['presencial', 'online', 'ambas'];
const ESTADOS = ['disponible', 'reservado', 'vendido'];

const TITULO_MIN = 3;
const TITULO_MAX = 100;
const DESCRIPCION_MAX = 2000;
const PRECIO_MAX = 99_999_999;

const textoOpcional = (max, mensaje) =>
  z
    .string()
    .trim()
    .max(max, mensaje)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

const tituloSchema = z
  .string({
    error: (i) =>
      i.input === undefined ? 'El título es requerido' : undefined,
  })
  .trim()
  .min(TITULO_MIN, `El título debe tener al menos ${TITULO_MIN} caracteres`)
  .max(TITULO_MAX, `El título no puede superar ${TITULO_MAX} caracteres`);

const precioSchema = z
  .number({
    error: (i) =>
      i.input === undefined
        ? 'El precio es requerido'
        : 'El precio no es válido',
  })
  .int('El precio debe ser un número entero (pesos)')
  .min(0, 'El precio no puede ser negativo')
  .max(PRECIO_MAX, 'El precio es demasiado alto');

const categoriaSchema = z.enum(CATEGORIAS, { error: 'Categoría inválida' });
const condicionSchema = z.enum(CONDICIONES, { error: 'Condición inválida' });
const unidadSchema = z
  .enum(UNIDADES_PRECIO, { error: 'Unidad de cobro inválida' })
  .nullable()
  .optional();
const modalidadSchema = z
  .enum(MODALIDADES, { error: 'Modalidad inválida' })
  .nullable()
  .optional();
const estadoSchema = z.enum(ESTADOS, { error: 'Estado inválido' });

const vacioANull = (v) => (v === '' ? null : v);

const whatsappSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()+-]/g, ''))
  .transform(vacioANull)
  .refine((v) => v === null || /^\d{8,15}$/.test(v), {
    message: 'El WhatsApp debe ser un número válido (ej: +56 9 1234 5678)',
  })
  .transform((v) => (v && v.length === 9 && v.startsWith('9') ? `56${v}` : v))
  .nullable()
  .optional();

const instagramSchema = z
  .string()
  .trim()
  .transform((v) =>
    v
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/[/?].*$/, '')
      .replace(/^@/, ''),
  )
  .transform(vacioANull)
  .refine((v) => v === null || /^[A-Za-z0-9._]{1,30}$/.test(v), {
    message: 'El usuario de Instagram no es válido (ej: @mi_usuario)',
  })
  .nullable()
  .optional();

const discordSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^@/, ''))
  .transform(vacioANull)
  .refine((v) => v === null || /^[A-Za-z0-9_.#]{2,37}$/.test(v), {
    message: 'El usuario de Discord no es válido (ej: mi_usuario)',
  })
  .nullable()
  .optional();

const camposContacto = {
  contacto_whatsapp: whatsappSchema,
  contacto_instagram: instagramSchema,
  contacto_discord: discordSchema,
};

const camposComunes = {
  descripcion: textoOpcional(
    DESCRIPCION_MAX,
    `La descripción no puede superar ${DESCRIPCION_MAX} caracteres`,
  ),
  negociable: z.boolean().optional(),
  entrega_domicilio: z.boolean().optional(),
  unidad_precio: unidadSchema,
  modalidad: modalidadSchema,
  ubicacion: textoOpcional(80, 'La ubicación no puede superar 80 caracteres'),
  ...camposContacto,
};

function revisarCoherencia(d, ctx) {
  const falta = (path, message) =>
    ctx.addIssue({ code: 'custom', path, message });
  if (d.categoria === 'servicios') {
    if (!d.modalidad) falta(['modalidad'], 'Indica si es presencial u online');
    if (!d.unidad_precio)
      falta(['unidad_precio'], 'Indica cómo cobras (por hora, clase...)');
  } else if (!d.condicion || d.condicion === 'servicio') {
    falta(['condicion'], 'Elige en qué condición está el producto');
  }
}

const crearProductoSchema = z
  .object({
    titulo: tituloSchema,
    precio: precioSchema,
    categoria: categoriaSchema,
    condicion: condicionSchema.optional(),
    estado: estadoSchema.optional(),
    ...camposComunes,
  })
  .superRefine((d, ctx) => {
    revisarCoherencia(d, ctx);
    if (!(d.contacto_whatsapp || d.contacto_instagram || d.contacto_discord)) {
      ctx.addIssue({
        code: 'custom',
        path: ['contacto_whatsapp'],
        message:
          'Agrega al menos un medio de contacto (WhatsApp, Instagram o Discord)',
      });
    }
  })
  .transform((d) =>
    d.categoria === 'servicios'
      ? { ...d, condicion: 'servicio' }
      : { ...d, modalidad: null, unidad_precio: null },
  );

const actualizarProductoSchema = z
  .object({
    titulo: tituloSchema.optional(),
    precio: precioSchema.optional(),
    categoria: categoriaSchema.optional(),
    condicion: condicionSchema.optional(),
    estado: estadoSchema.optional(),
    ...camposComunes,
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'No hay nada que actualizar',
  });

const listarProductosQuerySchema = paginacionQuerySchema.extend({
  categoria: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(z.array(categoriaSchema).min(1).max(CATEGORIAS.length))
    .optional(),
  condicion: condicionSchema.optional(),
  estado: estadoSchema.optional(),
  orden: z
    .enum(['recientes', 'precio_asc', 'precio_desc'], {
      error: 'Orden inválido',
    })
    .optional(),
  precio_min: z.coerce.number().int().min(0).max(PRECIO_MAX).optional(),
  precio_max: z.coerce.number().int().min(0).max(PRECIO_MAX).optional(),
  solo_mios: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  busqueda: z.string().trim().max(100).optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  revisarCoherencia,
  UNIDADES_PRECIO,
  MODALIDADES,
  CATEGORIAS,
  CONDICIONES,
  ESTADOS,
  crearProductoSchema,
  actualizarProductoSchema,
  listarProductosQuerySchema,
};
