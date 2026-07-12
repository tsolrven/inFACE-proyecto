import { useEffect, useRef, useCallback } from 'react';
import { useGuardadosStore } from '../../stores/guardadosStore';
import MaterialCard from './MaterialCard';
import SavedCommentCard from './SavedCommentCard';

export default function GuardadosFeed() {
  const tipo = useGuardadosStore((s) => s.tipo);
  const items = useGuardadosStore((s) => s.items);
  const cargando = useGuardadosStore((s) => s.cargando);
  const cargandoMas = useGuardadosStore((s) => s.cargandoMas);
  const error = useGuardadosStore((s) => s.error);
  const meta = useGuardadosStore((s) => s.meta);
  const setTipo = useGuardadosStore((s) => s.setTipo);
  const fetchGuardados = useGuardadosStore((s) => s.fetchGuardados);
  const cargarMasGuardados = useGuardadosStore((s) => s.cargarMasGuardados);
  const quitarDeGuardados = useGuardadosStore((s) => s.quitarDeGuardados);

  useEffect(() => {
    fetchGuardados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const centinelaRef = useRef(null);
  const handleObserver = useCallback(
    (entries) => {
      if (entries[0].isIntersecting) cargarMasGuardados();
    },
    [cargarMasGuardados],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    });
    if (centinelaRef.current) observer.observe(centinelaRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='mb-3 flex gap-1'>
        <button
          type='button'
          onClick={() => setTipo('apunte')}
          className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
            tipo === 'apunte'
              ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
              : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
          }`}
        >
          <i className='ti ti-file-text text-sm' /> Materiales
        </button>
        <button
          type='button'
          onClick={() => setTipo('comentario')}
          className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
            tipo === 'comentario'
              ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
              : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
          }`}
        >
          <i className='ti ti-message-circle-2 text-sm' /> Comentarios
        </button>
      </div>

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

      {!cargando && items.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-bookmark mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            No tienes {tipo === 'apunte' ? 'materiales' : 'comentarios'}{' '}
            guardados
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            Usa el ícono de marcador en cualquier{' '}
            {tipo === 'apunte' ? 'publicación' : 'comentario'} para guardarlo
            aquí.
          </p>
        </div>
      )}

      {tipo === 'apunte'
        ? items.map((apunte) => (
            <MaterialCard
              key={apunte.id}
              apunte={apunte}
              onQuitarDeGuardados={quitarDeGuardados}
            />
          ))
        : items.map((comentario) => (
            <SavedCommentCard
              key={comentario.id}
              comentario={comentario}
              onQuitarDeGuardados={quitarDeGuardados}
            />
          ))}

      <div
        ref={centinelaRef}
        className='h-1'
      />

      {cargandoMas && (
        <div className='flex items-center justify-center py-4 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-xl' />
        </div>
      )}

      {meta && !meta.hasNext && items.length > 0 && (
        <p className='py-4 text-center text-[11.5px] text-neutral-700'>
          Llegaste al final — {meta.total} guardados en total
        </p>
      )}
    </div>
  );
}
