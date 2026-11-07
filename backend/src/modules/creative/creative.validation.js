import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import {
  hashtagsSchema,
  hashtagFiltroSchema,
} from '../../shared/hashtags/hashtags.validation.js';
import { crearMarkdownSchema } from '../../shared/validation/markdown.validation.js';
// ─────────────────────────────────────────────────────────────────────────────
const TIPOS_OBRA = [
  'musica',
  'album',
  'visual',
  'audiovisual',
  'poema',
  'historia',
  'guion',
];
const FUENTES_POEMA = [
  'playfair',
  'cormorant',
  'lora',
  'dancing',
  'caveat',
  'special',
];
const TITULO_MIN = 3;
const TITULO_MAX = 150;
const DESCRIPCION_MAX = 3000;
const TEXTO_MAX = 50000;
const CAPITULO_MAX = 40000;
const CAPITULOS_MAX = 50;
const PERSONAJES_MAX = 30;
const PISTAS_MAX = 40;

const HOSTS_PERMITIDOS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'open.spotify.com',
  'soundcloud.com',
];

function hostPermitido(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return HOSTS_PERMITIDOS.some((h) => host === h || host.endsWith(`.${h}`));
}

const enlaceSchema = z
  .string()
  .trim()
  .max(300, 'El enlace es demasiado largo')
  .refine((valor) => {
    if (valor === '') return true;
    try {
      const url = new URL(valor);
      return url.protocol === 'https:' && hostPermitido(url.hostname);
    } catch {
      return false;
    }
  }, 'Solo se aceptan enlaces https de YouTube, Vimeo, Spotify o SoundCloud')
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();
// ─────────────────────────────────────────────────────────────────────────────
const tituloSchema = z
  .string({
    error: (i) =>
      i.input === undefined ? 'El título es requerido' : undefined,
  })
  .trim()
  .min(TITULO_MIN, `El título debe tener al menos ${TITULO_MIN} caracteres`)
  .max(TITULO_MAX, `El título no puede superar ${TITULO_MAX} caracteres`);

const guionIdSchema = z
  .string()
  .uuid('El guion no es válido')
  .nullable()
  .optional();

const capituloSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z
    .string()
    .trim()
    .min(1, 'Cada capítulo necesita un título')
    .max(150, 'El título del capítulo no puede superar 150 caracteres'),
  contenido: crearMarkdownSchema(CAPITULO_MAX, { preset: 'creativo' }),
  borrador: z.boolean().optional(),
});

const personajeSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z
    .string()
    .trim()
    .min(1, 'Cada personaje necesita un nombre')
    .max(80, 'El nombre del personaje no puede superar 80 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(1000, 'La descripción del personaje no puede superar 1000 caracteres')
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
});

const capitulosSchema = z
  .array(capituloSchema)
  .max(CAPITULOS_MAX, `Máximo ${CAPITULOS_MAX} capítulos`);
const personajesSchema = z
  .array(personajeSchema)
  .max(PERSONAJES_MAX, `Máximo ${PERSONAJES_MAX} personajes`);
const pistaSchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z
    .string()
    .trim()
    .min(1, 'Cada pista necesita un título')
    .max(150, 'El título de la pista no puede superar 150 caracteres'),
  enlace_url: enlaceSchema,
});
const pistasSchema = z
  .array(pistaSchema)
  .max(PISTAS_MAX, `Máximo ${PISTAS_MAX} pistas`);

const firmaSchema = z
  .string()
  .trim()
  .max(80, 'La firma no puede superar 80 caracteres')
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

const estiloSchema = z
  .object({
    fuente: z.enum(FUENTES_POEMA, { error: 'Fuente no disponible' }),
    alineacion: z.enum(['izquierda', 'centro'], {
      error: 'Alineación inválida',
    }),
  })
  .optional();
// ─────────────────────────────────────────────────────────────────────────────
const crearObraSchema = z.object({
  tipo: z.enum(TIPOS_OBRA, { error: 'Tipo de obra inválido' }),
  titulo: tituloSchema,
  borrador: z.boolean().optional(),
  descripcion: crearMarkdownSchema(DESCRIPCION_MAX, { preset: 'creativo' }),
  texto: crearMarkdownSchema(TEXTO_MAX, { preset: 'creativo' }),
  enlace_url: enlaceSchema,
  es_galeria: z.boolean().optional(),
  guion_id: guionIdSchema,
  firma: firmaSchema,
  estilo: estiloSchema,
  hashtags: hashtagsSchema,
  capitulos: capitulosSchema.optional(),
  personajes: personajesSchema.optional(),
  pistas: pistasSchema.optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
const actualizarObraSchema = z.object({
  titulo: tituloSchema.optional(),
  borrador: z.boolean().optional(),
  descripcion: crearMarkdownSchema(DESCRIPCION_MAX, { preset: 'creativo' }),
  texto: crearMarkdownSchema(TEXTO_MAX, { preset: 'creativo' }),
  enlace_url: enlaceSchema,
  guion_id: guionIdSchema,
  firma: firmaSchema,
  estilo: estiloSchema,
  hashtags: hashtagsSchema,
  capitulos: capitulosSchema.optional(),
  personajes: personajesSchema.optional(),
  pistas: pistasSchema.optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
const listarObrasQuerySchema = paginacionQuerySchema.extend({
  tipo: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(
      z
        .array(z.enum(TIPOS_OBRA, { error: 'Tipo de obra inválido' }))
        .min(1)
        .max(TIPOS_OBRA.length),
    )
    .optional(),
  hashtag: hashtagFiltroSchema.optional(),
  orden: z
    .enum(['recientes', 'populares'], { error: 'Orden inválido' })
    .optional(),
  solo_mias: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  busqueda: z.string().trim().max(100).optional(),
});

const hashtagsPopularesQuerySchema = z.object({
  limite: z.coerce.number().int().min(1).max(60).optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  TIPOS_OBRA,
  FUENTES_POEMA,
  crearObraSchema,
  actualizarObraSchema,
  listarObrasQuerySchema,
  hashtagsPopularesQuerySchema,
};