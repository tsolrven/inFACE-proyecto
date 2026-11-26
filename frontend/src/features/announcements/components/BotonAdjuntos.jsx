import { abrirArchivoEnPestana } from '@/shared/api/archivos.api';
import { mostrarToast } from '@/shared/stores/toastStore';

// PDF del anuncio en la tarjeta del feed: botón compacto (sin miniaturas,
// para no descargar PDFs al hacer scroll). Con un PDF, lo abre en una pestaña
// nueva; con varios, deja pasar el clic a la tarjeta, que abre el detalle
// (ahí están las tarjetas con miniatura).
export default function BotonAdjuntos({ archivos }) {
  const pdfs = (archivos ?? []).filter(
    (a) => a.tipo_mime === 'application/pdf',
  );
  if (pdfs.length === 0) return null;

  const varios = pdfs.length > 1;

  async function alClic(e) {
    if (varios) return;
    e.stopPropagation();
    try {
      await abrirArchivoEnPestana(pdfs[0]);
    } catch (err) {
      mostrarToast(err.message || 'No se pudo abrir el archivo');
    }
  }

  return (
    <button
      type='button'
      onClick={alClic}
      className='flex max-w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left text-[12px] transition-colors hover:border-amber-400/40 hover:bg-amber-400/[0.06]'
    >
      <i className='ti ti-file-type-pdf flex-shrink-0 text-[18px] text-[#E8546A]' />
      <span className='min-w-0 truncate font-medium text-neutral-200'>
        {varios ? `${pdfs.length} PDF adjuntos` : pdfs[0].nombre_archivo}
      </span>
    </button>
  );
}