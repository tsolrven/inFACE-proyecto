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

export { buscarUsuariosQuerySchema, BUSQUEDA_MIN, BUSQUEDA_MAX };