import { useEffect, useRef, useCallback } from 'react';
import { useRepositorioStore } from '../../stores/repositorioStore';
import FeedTopbar from './FeedTopbar';
import QuickUploadBox from './QuickUploadBox';
import MaterialCard from './MaterialCard';

export default function MaterialFeed({ carreraId, onAbrirSubida }) {
  const apuntes = useRepositorioStore((s) => s.apuntes);
  const cargando = useRepositorioStore((s) => s.cargando);
  const cargandoMas = useRepositorioStore((s) => s.cargandoMas);
  const error = useRepositorioStore((s) => s.error);
  const meta = useRepositorioStore((s) => s.meta);
  const fetchApuntes = useRepositorioStore((s) => s.fetchApuntes);
  const cargarMasApuntes = useRepositorioStore((s) => s.cargarMasApuntes);

  useEffect(() => {
    fetchApuntes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const centinelaRef = useRef(null);
  const handleObserver = useCallback(
    (entries) => {
      if (entries[0].isIntersecting) cargarMasApuntes();
    },
    [cargarMasApuntes],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    if (centinelaRef.current) observer.observe(centinelaRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <FeedTopbar carreraId={carreraId} onAbrirSubida={onAbrirSubida} />
      <QuickUploadBox onClick={onAbrirSubida} />

      {error && (
        <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error}
        </div>
      )}

      {cargando && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!cargando && apuntes.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>No hay materiales todavía</p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            Sé el primero en compartir algo con la comunidad.
          </p>
        </div>
      )}

      {apuntes.map((apunte) => (
        <MaterialCard key={apunte.id} apunte={apunte} />
      ))}

      <div ref={centinelaRef} className='h-1' />

      {cargandoMas && (
        <div className='flex items-center justify-center py-4 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-xl' />
        </div>
      )}

      {meta && !meta.hasNext && apuntes.length > 0 && (
        <p className='py-4 text-center text-[11.5px] text-neutral-700'>
          Llegaste al final — {meta.total} materiales en total
        </p>
      )}
    </div>
  );
}
