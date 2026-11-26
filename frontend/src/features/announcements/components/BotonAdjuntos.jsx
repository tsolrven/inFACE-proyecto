import { abrirArchivoEnPestana } from '@/shared/api/archivos.api';
import { mostrarToast } from '@/shared/stores/toastStore';

// PDF del anuncio, a la vista: con 1, "Ver PDF" lo abre en otra pestaña; con
// varios, abre el detalle (donde está la lista con descargas).
export default function BotonAdjuntos({ archivos, onVerTodos }) {
  const pdfs = (archivos ?? []).filter(
    (a) => a.tipo_mime === 'application/pdf',
  );
  if (pdfs.length === 0) return null;

  async function verPdf(e) {
    e.stopPropagation();
    try {
      await abrirArchivoEnPestana(pdfs[0]);
    } catch (err) {
      mostrarToast(err.message || 'No se pudo abrir el PDF');
    }
  }

  const varios = pdfs.length > 1;

  return (
    <button
      type='button'
      onClick={
        varios
          ? (e) => {
            e.stopPropagation();
            onVerTodos?.();
          }
          : verPdf
      }
      className='flex max-w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left text-[12px] transition-colors hover:border-amber-400/40 hover:bg-amber-400/[0.06]'
    >
      <i className='ti ti-file-type-pdf flex-shrink-0 text-[18px] text-[#E8546A]' />
      <span className='min-w-0 truncate font-medium text-neutral-200'>
        {varios ? `${pdfs.length} PDF adjuntos` : pdfs[0].nombre_archivo}
      </span>
      <span className='flex-shrink-0 font-semibold text-amber-400'>
        {varios ? 'Ver' : 'Ver PDF'}
      </span>
    </button>
  );
}