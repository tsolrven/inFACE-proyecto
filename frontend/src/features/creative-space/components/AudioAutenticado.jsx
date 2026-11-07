import { useEffect, useState } from 'react';
import { obtenerImagen } from '@/shared/api/archivos.api';

export default function AudioAutenticado({ archivo, autoInicio = false }) {
  const [url, setUrl] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  useEffect(() => {
    if (autoInicio) cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(false);
    try {
      const blob = await obtenerImagen(archivo.id);
      setUrl(URL.createObjectURL(blob));
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className='rounded-[10px] border border-white/[0.07] bg-[#17171B] p-3'>
      <div className='mb-2 flex items-center gap-2 text-[12px] text-neutral-300'>
        <i className='ti ti-music text-pink-400' />
        <span className='truncate'>{archivo.nombre_archivo}</span>
      </div>
      {url ? (
        <audio
          src={url}
          controls
          autoPlay
          className='w-full'
        />
      ) : (
        <button
          type='button'
          onClick={cargar}
          disabled={cargando}
          className='flex items-center gap-1.5 rounded-full bg-pink-500/15 px-3 py-1.5 text-[12px] font-semibold text-pink-400 transition-colors hover:bg-pink-500/25 disabled:opacity-60'
        >
          <i
            className={`ti ${cargando ? 'ti-loader-2 animate-spin' : 'ti-player-play'}`}
          />
          {cargando ? 'Cargando…' : 'Reproducir'}
        </button>
      )}
      {error && (
        <p className='mt-2 text-[11.5px] text-red-400'>
          No se pudo cargar el audio. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}
