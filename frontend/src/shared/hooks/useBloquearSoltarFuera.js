import { useEffect } from 'react';
import { traeArchivos } from '@/shared/lib/archivos';

// Si se suelta un archivo fuera de una zona preparada, el navegador lo abre y
// se sale de InFACE (perdiendo lo escrito). Se bloquea en toda la app.
// Las zonas preparadas (ArchivosInput, compositor de comentarios) llaman a
// preventDefault antes, porque React escucha en #root, que está debajo de
// window. Este listener respeta esa decisión (defaultPrevented).
function alArrastrar(e) {
  if (e.defaultPrevented || !traeArchivos(e)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'none'; // cursor de "no se puede soltar aquí"
}

function alSoltar(e) {
  if (e.defaultPrevented || !traeArchivos(e)) return;
  e.preventDefault();
}

export default function useBloquearSoltarFuera() {
  useEffect(() => {
    window.addEventListener('dragover', alArrastrar);
    window.addEventListener('drop', alSoltar);
    return () => {
      window.removeEventListener('dragover', alArrastrar);
      window.removeEventListener('drop', alSoltar);
    };
  }, []);
}