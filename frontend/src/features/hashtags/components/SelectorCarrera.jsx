import { useEffect, useRef, useState } from 'react';

// Selector de carrera del banner de un hashtag. Mismo diseño que el orden del
// foro (ForumTopbar), con las esquinas del buscador. El botón muestra el
// código; el menú, código y nombre. `colorActivo`: clase de texto de la
// opción elegida (el color de la pestaña actual).
export default function SelectorCarrera({
  carreras,
  carrera,
  onCambiar,
  colorActivo = 'text-pink-500',
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function alClicFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    function alTeclear(e) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [abierto]);

  return (
    <div
      className='relative flex-shrink-0'
      ref={ref}
    >
      <button
        type='button'
        onClick={() => setAbierto((a) => !a)}
        disabled={carreras.length === 0}
        aria-expanded={abierto}
        aria-haspopup='true'
        aria-label={`Carrera: ${carrera?.nombre ?? 'sin elegir'}`}
        title={carrera?.nombre ?? 'Elige una carrera'}
        className='flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/35 px-3 text-[12.5px] font-medium text-neutral-100 transition-colors hover:border-white/60 hover:bg-white/[0.08] hover:text-white disabled:opacity-50'
      >
        <i className='ti ti-building text-sm' />
        {carrera ? carrera.codigo.toUpperCase() : 'Carrera'}
        <i
          className={`ti ti-chevron-down text-xs transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        // mismo ancho que el botón (inset-x-0 sobre el contenedor relativo)
        <div className='absolute inset-x-0 top-[calc(100%+6px)] z-[450] max-h-[320px] overflow-y-auto rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
          {carreras.map((c) => {
            const activa = c.id === carrera?.id;
            return (
              <button
                key={c.id}
                type='button'
                aria-pressed={activa}
                onClick={() => {
                  onCambiar(c.codigo);
                  setAbierto(false);
                }}
                className={`flex w-full items-center px-3.5 py-2 text-left text-[12.5px] font-semibold transition-colors hover:bg-white/[0.04] ${activa ? colorActivo : 'text-neutral-300'}`}
              >
                {c.codigo.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}