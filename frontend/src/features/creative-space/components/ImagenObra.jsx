import { useImagenAutenticada } from '@/shared/post/images/useImagenAutenticada';
import useEnPantalla from '@/shared/hooks/useEnPantalla';

export default function ImagenObra({
  archivoId,
  alt = '',
  icono = 'ti-photo',
  className = '',
  imgClassName = 'h-full w-full object-cover',
  natural = false, 
  fallbackSrc = null, 
  children,
}) {
  const [ref, visible] = useEnPantalla();
  const { data: url } = useImagenAutenticada(archivoId, {
    enabled: visible && !!archivoId,
  });

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      {url || fallbackSrc ? (
        <img
          src={url ?? fallbackSrc}
          alt={alt}
          decoding='async'
          draggable={false}
          className={natural ? 'block h-auto w-full' : imgClassName}
        />
      ) : natural ? (
        <div className='flex aspect-[2/3] w-full items-center justify-center text-neutral-700'>
          <i className={`ti ${icono} text-3xl`} />
        </div>
      ) : (
        <div className='flex h-full w-full items-center justify-center text-neutral-700'>
          <i className={`ti ${icono} text-3xl`} />
        </div>
      )}
      {children}
    </div>
  );
}
