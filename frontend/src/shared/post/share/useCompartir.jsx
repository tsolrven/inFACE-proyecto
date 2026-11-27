import { useState } from 'react';
import CompartirModal from '@/shared/post/share/CompartirModal';

// Lógica de compartir, para un botón (BotonCompartir) o una opción de menú.
// En pantallas táctiles abre el menú nativo del sistema (incluye las apps
// instaladas, como Discord); si no existe o falla, el modal. En escritorio,
// directo el modal. `compartir` debe llamarse dentro del clic (el menú nativo
// exige un gesto del usuario). `modal` se renderiza donde se use el hook.
export function useCompartir({ path, titulo, texto, vistaPrevia }) {
  const [abierto, setAbierto] = useState(false);

  async function compartir() {
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

  const modal = (
    <CompartirModal
      open={abierto}
      onClose={() => setAbierto(false)}
      path={path}
      titulo={titulo}
      texto={texto}
      vistaPrevia={vistaPrevia}
    />
  );

  return { compartir, modal };
}