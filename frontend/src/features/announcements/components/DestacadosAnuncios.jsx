import { useEffect, useId, useRef, useState } from 'react';
import TarjetaDestacado from '@/features/announcements/components/TarjetaDestacado';

const PREFIJO = 'inface:destacados:';

// { plegado, vistos }: lo que el usuario vio la última vez que plegó o desplegó
function leerEstado(carreraId) {
  try {
    const crudo = JSON.parse(localStorage.getItem(PREFIJO + carreraId));
    return {
      plegado: crudo?.plegado === true,
      vistos: Array.isArray(crudo?.vistos) ? crudo.vistos : [],
    };
  } catch {
    return { plegado: false, vistos: [] };
  }
}

function guardarEstado(carreraId, estado) {
  try {
    localStorage.setItem(PREFIJO + carreraId, JSON.stringify(estado));
  } catch {
    // sin almacenamiento: no se recuerda, y no pasa nada
  }
}

// Fila de destacados tipo "Community highlights": tarjetas en carrusel
// horizontal (flechas en escritorio, deslizar en celular), plegable. Si
// aparece un destacado que el usuario no había visto, se despliega sola.
export default function DestacadosAnuncios({ anuncios, carreraId }) {
  const [estado, setEstado] = useState(() => leerEstado(carreraId));
  const filaRef = useRef(null);
  const idFila = useId();
  const [bordes, setBordes] = useState({ izq: false, der: false });

  const ids = anuncios.map((a) => a.id);
  const hayNuevo = ids.some((id) => !estado.vistos.includes(id));
  const abierto = !estado.plegado || hayNuevo;

  function alternar() {
    const nuevo = { plegado: abierto, vistos: ids };
    setEstado(nuevo);
    guardarEstado(carreraId, nuevo);
  }

  // flechas: solo si hay contenido oculto hacia ese lado
  function medir() {
    const el = filaRef.current;
    if (!el) return;
    setBordes({
      izq: el.scrollLeft > 4,
      der: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }

  useEffect(() => {
    const el = filaRef.current;
    if (!abierto || !el) return;
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [abierto, anuncios.length]);

  function desplazar(sentido) {
    const el = filaRef.current;
    el?.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  if (anuncios.length === 0) return null;

  return (
    <section
      aria-label='Anuncios destacados'
      className='mb-4'
    >
      <div className='mb-2 flex items-center gap-2'>
        <button
          type='button'
          onClick={alternar}
          aria-expanded={abierto}
          aria-controls={idFila}
          className='flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] font-bold text-neutral-200 transition-colors hover:bg-white/[0.05]'
        >
          <i className='ti ti-pin text-[14px] text-amber-400' />
          Destacados
          <span className='text-neutral-500'>({anuncios.length})</span>
          <i
            className={`ti ti-chevron-down text-[13px] text-neutral-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
          />
        </button>

        {abierto && (bordes.izq || bordes.der) && (
          <div className='ml-auto hidden gap-1 sm:flex'>
            {[
              [-1, 'ti-chevron-left', 'Anteriores', bordes.izq],
              [1, 'ti-chevron-right', 'Siguientes', bordes.der],
            ].map(([sentido, icono, etiqueta, activo]) => (
              <button
                key={sentido}
                type='button'
                onClick={() => desplazar(sentido)}
                disabled={!activo}
                aria-label={etiqueta}
                className='flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] text-neutral-300 transition-colors hover:border-amber-400/40 hover:text-amber-300 disabled:opacity-30'
              >
                <i className={`ti ${icono} text-[14px]`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {abierto && (
        <div
          id={idFila}
          ref={filaRef}
          onScroll={medir}
          className='scrollbar-destacados flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2'
        >
          {anuncios.map((anuncio) => (
            <TarjetaDestacado
              key={anuncio.id}
              anuncio={anuncio}
            />
          ))}
        </div>
      )}
    </section>
  );
}