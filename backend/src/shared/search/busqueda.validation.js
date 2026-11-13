import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
// Reglas de la búsqueda por texto de los listados y guardados.
// Deben coincidir con el frontend (useDebounce + barra de búsqueda).
const BUSQUEDA_MIN = 2;
const BUSQUEDA_MAX = 100;

// ?busqueda=... en los listados. El mínimo NO se exige aquí: un término más
// corto simplemente no filtra (lo decide interpretarBusqueda), así una
// búsqueda como "#c" no responde 400 mientras el usuario escribe.
const busquedaQuerySchema = z
  .string()
  .trim()
  .max(
    BUSQUEDA_MAX,
    `La búsqueda no puede superar ${BUSQUEDA_MAX} caracteres`,
  )
  .optional();
// ─────────────────────────────────────────────────────────────────────────────
export { BUSQUEDA_MIN, BUSQUEDA_MAX, busquedaQuerySchema };