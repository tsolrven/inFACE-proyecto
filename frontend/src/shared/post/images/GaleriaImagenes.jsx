import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useModalBehavior from '@/shared/hooks/useModalBehavior';
import { useImagenAutenticada } from '@/shared/post/images/useImagenAutenticada';

function Cargando() {
  return (
    <div className='flex h-full w-full items-center justify-center text-neutral-600'>
      <i className='ti ti-loader-2 animate-spin text-xl' />
    </div>
  );
}

function ErrorImagen({ onReintentar }) {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center'>
      <i className='ti ti-photo-off text-xl text-neutral-600' />
      <span className='text-[11px] text-neutral-500'>No se pudo cargar</span>
      <button
        type='button'
        onClick={onReintentar}
        className='text-[11px] font-medium text-blue-400 hover:underline'
      >
        Reintentar
      </button>
    </div>
  );
}

function Miniatura({ archivo, onAbrir }) {
  const {
    data: url,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useImagenAutenticada(archivo.id);

  return (
    <div className='relative aspect-square overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#17171B]'>
      {isError && !isFetching ? (
        <ErrorImagen onReintentar={refetch} />
      ) : isPending || !url ? (
        <Cargando />
      ) : (
        <button
          type='button'
          onClick={onAbrir}
          aria-label={`Ampliar ${archivo.nombre_archivo}`}
          className='h-full w-full cursor-zoom-in'
        >
          <img
            src={url}
            alt={archivo.nombre_archivo}
            decoding='async'
            draggable={false}
            className='h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]'
          />
        </button>
      )}
    </div>
  );
}

function Visor({ imagenes, indice, onCambiar, onCerrar }) {
  useModalBehavior(true, onCerrar); // Esc cierra solo el visor, no el detalle

  const archivo = imagenes[indice];
  const {
    data: url,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useImagenAutenticada(archivo.id);
  const varias = imagenes.length > 1;

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') onCambiar(indice - 1);
      if (e.key === 'ArrowRight') onCambiar(indice + 1);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [indice, onCambiar]);

  return createPortal(
    <div
      className='fixed inset-0 z-[10001] flex items-center justify-center bg-black/90 p-4'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      role='dialog'
      aria-modal='true'
      aria-label='Visor de imágenes'
    >
      <button
        type='button'
        onClick={onCerrar}
        aria-label='Cerrar visor'
        className='absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-neutral-100 hover:bg-white/20'
      >
        <i className='ti ti-x' />
      </button>

      {varias && (
        <>
          <button
            type='button'
            onClick={() => onCambiar(indice - 1)}
            aria-label='Imagen anterior'
            className='absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-neutral-100 hover:bg-white/20'
          >
            <i className='ti ti-chevron-left' />
          </button>
          <button
            type='button'
            onClick={() => onCambiar(indice + 1)}
            aria-label='Imagen siguiente'
            className='absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-neutral-100 hover:bg-white/20'
          >
            <i className='ti ti-chevron-right' />
          </button>
        </>
      )}

      <div className='flex max-h-full max-w-full items-center justify-center'>
        {isError && !isFetching ? (
          <div className='h-48 w-64'>
            <ErrorImagen onReintentar={refetch} />
          </div>
        ) : isPending || !url ? (
          <i className='ti ti-loader-2 animate-spin text-3xl text-neutral-400' />
        ) : (
          <img
            src={url}
            alt={archivo.nombre_archivo}
            className='max-h-[85vh] max-w-[92vw] rounded-lg object-contain'
          />
        )}
      </div>

      <div className='absolute bottom-4 left-1/2 flex max-w-[80vw] -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[12px] text-neutral-300'>
        <span className='truncate'>{archivo.nombre_archivo}</span>
        {varias && (
          <span className='tabular-nums text-neutral-500'>
            {indice + 1} / {imagenes.length}
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Galería de imágenes adjuntas (cualquier tipo de contenido). Recibe la lista
 * `archivos` tal como llega del backend. Ignora lo que no sea imagen.
 */
export default function GaleriaImagenes({ archivos }) {
  const imagenes = (archivos ?? []).filter((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const total = imagenes.length;
  const [visor, setVisor] = useState(null); // null = cerrado; número = índice abierto

  const cambiar = useCallback(
    (i) => setVisor(((i % total) + total) % total), // da la vuelta en los extremos
    [total],
  );
  const cerrar = useCallback(() => setVisor(null), []);

  if (total === 0) return null;

  return (
    <>
      <div
        className={`grid gap-2 ${
          total === 1
            ? 'max-w-[340px] grid-cols-1'
            : 'grid-cols-2 sm:grid-cols-3'
        }`}
      >
        {imagenes.map((archivo, i) => (
          <Miniatura
            key={archivo.id}
            archivo={archivo}
            onAbrir={() => setVisor(i)}
          />
        ))}
      </div>

      {visor !== null && visor < total && (
        <Visor
          imagenes={imagenes}
          indice={visor}
          onCambiar={cambiar}
          onCerrar={cerrar}
        />
      )}
    </>
  );
}
