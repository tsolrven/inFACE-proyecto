// Clases de las píldoras de las secciones de filtros del panel derecho
// (anuncios, foro, materiales). El color del borde va en cada variante, no en
// la base, para que no choquen.
export const PILDORA =
  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors';
export const PILDORA_NEUTRA_ACTIVA =
  'border-transparent bg-white/[0.12] text-neutral-100';
export const PILDORA_NEUTRA =
  'border-transparent bg-white/[0.04] text-neutral-500 hover:text-neutral-200';
// píldora de un filtro activo en la barra del feed (se quita con un clic)
export const PILDORA_QUITAR =
  'flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80';