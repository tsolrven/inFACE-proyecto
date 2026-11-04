// Deben coincidir con COLORES_FLAIR de backend/src/modules/announcements/flairs.validation.js
// Las clases van escritas completas para que Tailwind las detecte.
export const FLAIR_COLORES = {
  rojo: 'bg-red-400/10 text-red-400',
  naranja: 'bg-orange-400/10 text-orange-400',
  amarillo: 'bg-amber-400/10 text-amber-400',
  verde: 'bg-emerald-400/10 text-emerald-400',
  azul: 'bg-blue-400/10 text-blue-400',
  violeta: 'bg-violet-400/10 text-violet-400',
  rosa: 'bg-pink-400/10 text-pink-400',
  gris: 'bg-neutral-400/10 text-neutral-400',
};

export function clasesFlair(color) {
  return FLAIR_COLORES[color] ?? FLAIR_COLORES.gris;
}
