import { useState } from 'react';
import ImagenObra from '@/features/creative-space/components/ImagenObra';

export default function FotosProducto({ archivos, titulo }) {
  const fotos = (archivos ?? []).filter((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const [indice, setIndice] = useState(0);
  const actual = fotos[Math.min(indice, fotos.length - 1)];

  return (
    <div className='flex flex-col gap-2'>
      <ImagenObra
        key={actual?.id ?? 'sin-foto'}
        archivoId={actual?.id}
        alt={titulo}
        icono='ti-photo'
        className='aspect-square w-full rounded-[12px] border border-white/[0.07] bg-[#17171B] sm:aspect-[4/3]'
        imgClassName='h-full w-full object-contain'
      />
      {fotos.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type='button'
              onClick={() => setIndice(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === indice}
              className={`h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === indice
                  ? 'border-pink-500'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <ImagenObra
                archivoId={f.id}
                alt=''
                className='h-full w-full bg-[#17171B]'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
