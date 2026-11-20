import { Fragment, useState } from 'react';
import { useActividad } from '@/shared/post/activity/useActividad';
import { useCentinela } from '@/shared/hooks/useCentinela';
import SavedCommentCard from '@/shared/post/bookmarks/SavedCommentCard';

// Actividad de un módulo en el perfil: «Publicaciones | Comentarios».
// Cada módulo pone su tarjeta (renderPublicacion) y la ruta de sus
// publicaciones (rutaDeComentario, la misma de sus guardados).
// carreraId: solo la actividad de esa carrera (siempre se filtra por una)
export default function ActividadFeed({
  usuarioId,
  carreraId = null,
  tipo,
  publicaciones, // { label, icono, vacio }
  renderPublicacion,
  rutaDeComentario,
}) {
  const [lista, setLista] = useState('publicaciones');
  const listas = [
    { valor: 'publicaciones', label: publicaciones.label, icono: publicaciones.icono },
    { valor: 'comentarios', label: 'Comentarios', icono: 'ti-message' },
  ];

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useActividad({ usuarioId, tipo, lista, carreraId });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div>
      <div className='mb-3 flex gap-1'>
        {listas.map((l) => (
          <button
            key={l.valor}
            type='button'
            onClick={() => setLista(l.valor)}
            className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${lista === l.valor
                ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
                : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
          >
            <i className={`ti ${l.icono} text-sm`} /> {l.label}
          </button>
        ))}
      </div>

      {error && (
        <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error.message}
        </div>
      )}

      {isPending && (
        <div className='flex items-center justify-center py-14 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!isPending && !error && items.length === 0 && (
        <div className='flex flex-col items-center py-14 text-center'>
          <i
            className={`ti ${lista === 'publicaciones' ? publicaciones.icono : 'ti-message'} mb-3 text-4xl text-neutral-700`}
          />
          <p className='max-w-xs text-[12.5px] leading-relaxed text-neutral-500'>
            {lista === 'publicaciones'
              ? publicaciones.vacio
              : 'Aún no hay comentarios en este módulo.'}
          </p>
        </div>
      )}

      {items.map((item) => (
        <Fragment key={item.id}>
          {lista === 'publicaciones' ? (
            renderPublicacion(item)
          ) : (
            <SavedCommentCard
              comentario={item}
              rutaDe={rutaDeComentario}
            />
          )}
        </Fragment>
      ))}

      <div
        ref={centinelaRef}
        className='h-1'
      />

      {isFetchingNextPage && (
        <div className='flex items-center justify-center py-4 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-xl' />
        </div>
      )}
    </div>
  );
}