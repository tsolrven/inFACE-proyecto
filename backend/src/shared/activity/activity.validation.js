import { z } from 'zod';
import { paginacionQuerySchema } from '../validation/common.schemas.js';

// Módulos académicos con actividad en el perfil (RF-T-12)
const TIPOS_ACTIVIDAD = ['apunte', 'hilo', 'anuncio'];
const LISTAS_ACTIVIDAD = ['publicaciones', 'comentarios'];

const actividadParamsSchema = z.object({
  usuarioId: z.string().uuid('El id del usuario no es válido'),
});

// carrera_id: solo la actividad de esa carrera (la carrera de la publicación,
// también para los comentarios). Sin él: todas (docente).
const actividadQuerySchema = paginacionQuerySchema.extend({
  tipo: z.enum(TIPOS_ACTIVIDAD, { error: 'Módulo inválido' }),
  lista: z.enum(LISTAS_ACTIVIDAD, { error: 'Lista inválida' }),
  carrera_id: z.string().uuid('El id de la carrera no es válido').optional(),
});

export { actividadParamsSchema, actividadQuerySchema, TIPOS_ACTIVIDAD };