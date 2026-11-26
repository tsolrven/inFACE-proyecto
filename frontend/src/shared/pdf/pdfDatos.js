import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/queryClient';
import { obtenerImagen } from '@/shared/api/archivos.api';
import { cargarPdfjs } from '@/shared/pdf/pdfjs';

// Miniaturas solo para PDF de hasta 10 MB (para generarla hay que bajar el
// archivo completo); los más grandes muestran una portada genérica
export const MAX_BYTES_MINIATURA = 10 * 1024 * 1024;
const ANCHO_MINIATURA = 360; // px reales (la tarjeta mide ~180 px: nítida en pantallas 2x)

// El PDF completo (Blob) en caché: miniatura y visor lo comparten, así abrir
// el visor después de ver la miniatura no lo vuelve a descargar.
// GET /archivos/:id/ver (con sesión, no cuenta como descarga).
function obtenerBlobPdf(id) {
  return queryClient.fetchQuery({
    queryKey: ['pdf-archivo', id],
    queryFn: ({ signal }) => obtenerImagen(id, signal),
    staleTime: Infinity,
  });
}

// pdf.js se queda con el buffer (lo transfiere a su worker), así que cada
// documento recibe una copia nueva sacada del Blob, que no cambia.
export async function abrirDocumentoPdf(id) {
  const [pdfjs, blob] = await Promise.all([cargarPdfjs(), obtenerBlobPdf(id)]);
  const datos = new Uint8Array(await blob.arrayBuffer());
  return pdfjs.getDocument({ data: datos, isEvalSupported: false });
}

// Dibuja una página en un canvas del ancho pedido (en píxeles reales)
export async function dibujarPagina(pagina, canvas, anchoPx) {
  const base = pagina.getViewport({ scale: 1 });
  const viewport = pagina.getViewport({ scale: anchoPx / base.width });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const tarea = pagina.render({
    canvas,
    canvasContext: canvas.getContext('2d'),
    viewport,
  });
  return tarea;
}

async function generarMiniatura(id) {
  const carga = await abrirDocumentoPdf(id);
  try {
    const doc = await carga.promise;
    const pagina = await doc.getPage(1);
    const canvas = document.createElement('canvas');
    await (await dibujarPagina(pagina, canvas, ANCHO_MINIATURA)).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    await carga.destroy();
  }
}

// Imagen (data URL) de la primera página. `enabled`: cuando la tarjeta está
// en pantalla y el PDF no supera el límite.
export function useMiniaturaPdf(archivo, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['pdf-miniatura', archivo.id],
    queryFn: () => generarMiniatura(archivo.id),
    enabled: enabled && (archivo.tamanio ?? 0) <= MAX_BYTES_MINIATURA,
    staleTime: Infinity,
    retry: false,
  });
}