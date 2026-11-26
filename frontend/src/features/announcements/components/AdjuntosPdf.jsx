import { useState } from 'react';
import TarjetaPdf from '@/shared/pdf/TarjetaPdf';
import VisorPdf from '@/shared/pdf/VisorPdf';

// PDF adjuntos de un anuncio, en tarjetas tipo Gmail (las imágenes van en la
// galería). Una tarjeta abre el visor en ese PDF; ← → pasan a los demás.
export default function AdjuntosPdf({ archivos }) {
  const [abierto, setAbierto] = useState(null);
  const pdfs = (archivos ?? []).filter(
    (a) => a.tipo_mime === 'application/pdf',
  );
  if (pdfs.length === 0) return null;

  return (
    <>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {pdfs.map((archivo, i) => (
          <TarjetaPdf
            key={archivo.id}
            archivo={archivo}
            onAbrir={() => setAbierto(i)}
          />
        ))}
      </div>
      {abierto !== null && (
        <VisorPdf
          archivos={pdfs}
          indiceInicial={abierto}
          onCerrar={() => setAbierto(null)}
        />
      )}
    </>
  );
}