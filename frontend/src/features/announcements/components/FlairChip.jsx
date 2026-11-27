import { clasesFlair } from '@/features/announcements/utils/flairColors';

const BASE = 'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide';

// Con `onClick` es un botón (filtrar el feed por este flair); sin él, solo una
// etiqueta, como en guardados, destacados, el detalle o el Inicio.
export default function FlairChip({ flair, onClick, activo = false }) {
  const clases = `${BASE} ${clasesFlair(flair.color)}`;

  if (!onClick) return <span className={clases}>{flair.nombre}</span>;

  return (
    <button
      type='button'
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={activo}
      title={activo ? 'Quitar filtro' : `Ver solo «${flair.nombre}»`}
      className={`${clases} transition-shadow hover:ring-1 hover:ring-current/40 ${activo ? 'ring-1 ring-current/60' : ''}`}
    >
      {flair.nombre}
    </button>
  );
}