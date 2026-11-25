import { useState } from 'react';
import CompartirModal from '@/shared/post/share/CompartirModal';

const CLASES_POR_DEFECTO =
  'flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200';

// En pantallas táctiles abre el menú nativo del sistema (incluye las apps
// instaladas, como Discord); si no existe o falla, el modal. En escritorio,
// directo el modal.
export default function BotonCompartir({
  path,
  titulo,
  texto,
  vistaPrevia,
  className,
}) {
  const [abierto, setAbierto] = useState(false);

  async function alHacerClic(e) {
    e.stopPropagation(); // no abrir la tarjeta que lo contiene
    const esTactil = window.matchMedia?.('(pointer: coarse)').matches;
    if (navigator.share && esTactil) {
      try {
        await navigator.share({
          title: titulo,
          text: texto ?? `${titulo} — en InFACE`,
          url: `${window.location.origin}${path}`,
        });
      } catch (err) {
        if (err.name !== 'AbortError') setAbierto(true);
      }
      return;
    }
    setAbierto(true);
  }

  return (
    <>
      <button
        type='button'
        onClick={alHacerClic}
        className={className ?? CLASES_POR_DEFECTO}
      >
        <i className='ti ti-share-3 text-[13px]' /> Compartir
      </button>
      <CompartirModal
        open={abierto}
        onClose={() => setAbierto(false)}
        path={path}
        titulo={titulo}
        texto={texto}
        vistaPrevia={vistaPrevia}
      />
    </>
  );
}