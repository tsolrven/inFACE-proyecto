import useEnPantalla from '@/shared/hooks/useEnPantalla';
import { useImagenAutenticada } from '@/shared/post/images/useImagenAutenticada';

/**
 * Portada para tarjetas de listado: la PRIMERA imagen adjunta, recortada a 16:9,
 * con el total en una insignia si hay más. Se descarga solo cuando la tarjeta
 * está por entrar en pantalla. El clic lo maneja la tarjeta que la contiene.
 */
export default function PortadaImagen({ archivos }) {
  const imagenes = (archivos ?? []).filter((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const portada = imagenes[0];

  const [ref, visible] = useEnPantalla();
  const {
    data: url,
    isError,
    isFetching,
    refetch,
  } = useImagenAutenticada(portada?.id, { enabled: visible && !!portada });

  if (!portada) return null;

  return (
    <div
      ref={ref}
      className='relative mb-2 aspect-video overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#17171B]'
    >
      {isError && !isFetching ? (
        <div className='flex h-full w-full flex-col items-center justify-center gap-1.5 text-center'>
          <i className='ti ti-photo-off text-xl text-neutral-600' />
          <span className='text-[11px] text-neutral-500'>
            No se pudo cargar la imagen
          </span>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation(); // no abrir el detalle
              refetch();
            }}
            className='text-[11px] font-medium text-blue-400 hover:underline'
          >
            Reintentar
          </button>
        </div>
      ) : url ? (
        <img
          src={url}
          alt={portada.nombre_archivo}
          decoding='async'
          draggable={false}
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center text-neutral-700'>
          <i className='ti ti-photo text-2xl' />
        </div>
      )}

      {imagenes.length > 1 && (
        <span className='absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-neutral-100'>
          <i className='ti ti-photo text-[12px]' />
          {imagenes.length}
        </span>
      )}
    </div>
  );
}
