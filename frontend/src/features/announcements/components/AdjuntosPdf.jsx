import {
  abrirArchivoEnPestana,
  descargarArchivo,
} from '@/shared/api/archivos.api';
import { formatearTamanio } from '@/shared/lib/archivos';
import { mostrarToast } from '@/shared/stores/toastStore';

// Lista de PDF adjuntos de un anuncio (las imágenes van en la galería).
export default function AdjuntosPdf({ archivos }) {
  const pdfs = (archivos ?? []).filter(
    (a) => a.tipo_mime === 'application/pdf',
  );
  if (pdfs.length === 0) return null;

  async function handleDescargar(archivo) {
    try {
      await descargarArchivo(archivo);
    } catch (err) {
      mostrarToast(err.message || 'No se pudo descargar el archivo');
    }
  }

  async function handleVer(archivo) {
    try {
      await abrirArchivoEnPestana(archivo);
    } catch (err) {
      mostrarToast(err.message || 'No se pudo abrir el archivo');
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      {pdfs.map((archivo) => (
        <div
          key={archivo.id}
          className='flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5'
        >
          <i className='ti ti-file-type-pdf flex-shrink-0 text-lg text-[#E8546A]' />
          <span className='flex-1 truncate text-[12.5px] font-medium text-neutral-300'>
            {archivo.nombre_archivo}
          </span>
          <button
            type='button'
            onClick={() => handleVer(archivo)}
            className='flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-amber-400 hover:opacity-75'
          >
            <i className='ti ti-external-link' /> Ver
          </button>
          <button
            type='button'
            onClick={() => handleDescargar(archivo)}
            className='flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-400 hover:opacity-75'
          >
            <i className='ti ti-download' /> Descargar
          </button>
          <span className='flex-shrink-0 text-[10.5px] leading-[18px] text-neutral-600'>
            {formatearTamanio(archivo.tamanio)}
          </span>
        </div>
      ))}
    </div>
  );
}
