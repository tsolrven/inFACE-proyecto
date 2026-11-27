import { useEffect, useRef, useState } from 'react';
import TarjetaDestacado from '@/features/announcements/components/TarjetaDestacado';

// Fila de destacados tipo "Community highlights": tarjetas en carrusel
// horizontal con flechas superpuestas y desplazamiento táctil. El botón que
// la pliega (BotonDestacados) va en la barra del feed; el feed monta esta
// fila solo cuando está abierta.
export default function DestacadosAnuncios({ anuncios, idFila }) {
  const filaRef = useRef(null);
  const [bordes, setBordes] = useState({ izq: false, der: false });

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
    if (!el) return;
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [anuncios.length]);

  function desplazar(sentido) {
    const el = filaRef.current;
    el?.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  if (anuncios.length === 0) return null;

  return (
    <section
      aria-label='Anuncios destacados'
      className='relative mb-4'
    >
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

      {bordes.izq && (
        <button
          type='button'
          onClick={() => desplazar(-1)}
          aria-label='Anuncios anteriores'
          className='absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-black/65'
        >
          <i className='ti ti-chevron-left text-[18px]' />
        </button>
      )}

      {bordes.der && (
        <button
          type='button'
          onClick={() => desplazar(1)}
          aria-label='Anuncios siguientes'
          className='absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-black/65'
        >
          <i className='ti ti-chevron-right text-[18px]' />
        </button>
      )}
    </section>
  );
}