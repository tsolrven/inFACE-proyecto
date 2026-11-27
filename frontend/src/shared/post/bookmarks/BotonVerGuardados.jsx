// clases completas para que Tailwind las detecte; mismo tono que "Enterado"
const ACTIVO = {
  emerald: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300',
  blue: 'border-blue-400/40 bg-blue-400/15 text-blue-300',
  amber: 'border-amber-400/40 bg-amber-400/15 text-amber-300',
};

// Interruptor de Guardados junto al buscador del banner: un clic muestra lo
// guardado, otro vuelve a las publicaciones. Activo: el color del módulo (el
// webfont de Tabler no dibuja ti-bookmark-filled, así que el ícono no cambia).
//   activo:    se están mostrando los guardados
//   onCambiar: recibe el nuevo valor (true = guardados)
//   color:     el del módulo (emerald | blue | amber)
export default function BotonVerGuardados({ activo, onCambiar, color }) {
  return (
    <button
      type='button'
      aria-pressed={activo}
      aria-label='Guardados'
      title={activo ? 'Volver a las publicaciones' : 'Ver tus guardados'}
      onClick={() => onCambiar(!activo)}
      className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] border transition-colors ${activo
          ? (ACTIVO[color] ?? ACTIVO.amber)
          : 'border-white/[0.07] bg-white/[0.06] text-neutral-400 hover:border-white/[0.14] hover:text-neutral-100'
        }`}
    >
      <i className='ti ti-bookmark text-[16px]' />
    </button>
  );
}