import { Fragment, useState } from 'react';
import { useGuardados } from '@/shared/post/bookmarks/useGuardados';
import { useCentinela } from '@/shared/hooks/useCentinela';

// Lista de guardados con pestañas. Cada módulo decide qué pestañas muestra y
// cómo se dibuja cada tarjeta:
//   tipos = [{ valor, padre?, label, icono, plural, singular, renderItem }]
// `valor` es el tipo guardado ('apunte', 'hilo', 'comentario') y debe ser único
// dentro del arreglo; `padre` filtra los comentarios por el tipo de contenido
// al que pertenecen; `renderItem(item)` devuelve la tarjeta.
export default function GuardadosFeed({ tipos }) {
  const [valor, setValor] = useState(tipos[0].valor);
  const actual = tipos.find((t) => t.valor === valor) ?? tipos[0];

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGuardados(actual.valor, { padre: actual.padre });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.meta?.total;

  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='mb-3 flex gap-1'>
        {tipos.map((t) => (
          <button
            key={t.valor}
            type='button'
            onClick={() => setValor(t.valor)}
            className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
              actual.valor === t.valor
                ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
                : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
            }`}
          >
            <i className={`ti ${t.icono} text-sm`} /> {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error.message}
        </div>
      )}

      {isPending && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!isPending && !error && items.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-bookmark mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            No tienes {actual.plural} guardados
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            Usa el ícono de marcador en cualquier {actual.singular} para
            guardarlo aquí.
          </p>
        </div>
      )}

      {items.map((item) => (
        <Fragment key={item.id}>{actual.renderItem(item)}</Fragment>
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

      {!hasNextPage && items.length > 0 && (
        <p className='py-4 text-center text-[11.5px] text-neutral-700'>
          Llegaste al final — {total} guardados en total
        </p>
      )}
    </div>
  );
}
