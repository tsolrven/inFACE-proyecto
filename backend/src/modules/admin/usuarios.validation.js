import { z } from 'zod';

const BUSQUEDA_MIN = 3;
const BUSQUEDA_MAX = 50;

const buscarUsuariosQuerySchema = z.object({
  q: z
    .string({ error: 'Escribe un nombre para buscar' })
    .trim()
    .min(BUSQUEDA_MIN, `Escribe al menos ${BUSQUEDA_MIN} caracteres`)
    .max(BUSQUEDA_MAX, `No puede superar ${BUSQUEDA_MAX} caracteres`),
});

const LISTAS_REPORTES = ['recibidos', 'realizados', 'eliminados'];

const reportesUsuarioQuerySchema = z.object({
  lista: z.enum(LISTAS_REPORTES, { error: 'La lista no es válida' }),
});

export {
  buscarUsuariosQuerySchema,
  reportesUsuarioQuerySchema,
  BUSQUEDA_MIN,
  BUSQUEDA_MAX,
};