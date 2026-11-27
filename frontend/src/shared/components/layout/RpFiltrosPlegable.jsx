import { useState } from 'react';

// clases completas para que Tailwind las detecte
const COLORES = {
  amber: {
    icono: 'text-amber-400',
    contador: 'bg-amber-400/15 text-amber-400',
  },
  emerald: {
    icono: 'text-emerald-400',
    contador: 'bg-emerald-400/15 text-emerald-400',
  },
  blue: {
    icono: 'text-blue-400',
    contador: 'bg-blue-400/15 text-blue-400',
  },
};

// Un grupo de la sección (Autor, Ramo, Tipo...). `fila`: los hijos son
// píldoras en fila; false para un control de ancho completo (selector de ramo).
export function GrupoFiltro({ titulo, fila = true, children }) {
  return (
    <div>
      <p className='mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500'>
        {titulo}
      </p>
      {fila ? <div className='flex flex-wrap gap-1.5'>{children}</div> : children}
    </div>
  );
}

// Sección "Filtros" del panel derecho, con el estilo de RpCard y el título
// como botón para plegarla (abierta por defecto, sin recordar el estado).
//   color:     el del módulo (amber | emerald | blue)
//   activos:   cuántos filtros hay puestos (se ve aunque esté plegada)
//   onLimpiar: quita todos los filtros de la sección
export default function RpFiltrosPlegable({
  color,
  activos = 0,
  onLimpiar,
  children,
}) {
  const [abierto, setAbierto] = useState(true);
  const c = COLORES[color] ?? COLORES.amber;

  return (
    <div className='rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3'>
      <button
        type='button'
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className='flex w-full items-center gap-1.5 text-left'
      >
        <i className={`ti ti-filter text-sm ${c.icono}`} />
        <span className='text-[11.5px] font-bold uppercase tracking-[0.6px] text-neutral-400'>
          Filtros
        </span>
        {activos > 0 && (
          <span
            className={`rounded-full px-1.5 text-[10px] font-bold ${c.contador}`}
          >
            {activos}
          </span>
        )}
        <i
          className={`ti ti-chevron-down ml-auto text-xs text-neutral-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className='mt-2.5 flex flex-col gap-3'>
          {children}

          {activos > 0 && (
            <button
              type='button'
              onClick={onLimpiar}
              className='flex items-center gap-1 self-start text-[11.5px] font-medium text-neutral-500 transition-colors hover:text-neutral-200'
            >
              <i className='ti ti-x text-[12px]' />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}