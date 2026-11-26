import TarjetaPdf from '@/shared/pdf/TarjetaPdf';

// PDF adjuntos de un anuncio, en tarjetas tipo Gmail (las imágenes van en la
// galería). Cada tarjeta abre su PDF en una pestaña nueva.
export default function AdjuntosPdf({ archivos }) {
  const pdfs = (archivos ?? []).filter(
    (a) => a.tipo_mime === 'application/pdf',
  );
  if (pdfs.length === 0) return null;

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
      {pdfs.map((archivo) => (
        <TarjetaPdf
          key={archivo.id}
          archivo={archivo}
        />
      ))}
    </div>
  );
}