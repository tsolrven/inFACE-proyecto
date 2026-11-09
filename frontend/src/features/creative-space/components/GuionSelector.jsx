import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Campo from '@/shared/components/form/Campo';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { listarObras } from '@/features/creative-space/api/creative.api';

export default function GuionSelector({ valor, tituloInicial, onCambiar }) {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [titulo, setTitulo] = useState(tituloInicial);

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const { data, isFetching } = useQuery({
    queryKey: ['obra', 'selector-guion', busqueda],
    queryFn: ({ signal }) =>
      listarObras({ tipo: 'guion', busqueda, limite: 8, signal }),
    enabled: busqueda.length >= 2,
  });

  if (valor) {
    return (
      <Campo label='Obra de teatro en que se basa (opcional)'>
        <div className='flex items-center gap-2 rounded-[10px] border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 text-[12.5px] text-neutral-200'>
          <i className='ti ti-book-2 text-emerald-400' />
          <span className='min-w-0 flex-1 truncate'>
            {titulo ?? 'Obra de teatro enlazada'}
          </span>
          <button
            type='button'
            onClick={() => {
              onCambiar(null);
              setTitulo(null);
            }}
            className='text-[11.5px] text-neutral-400 hover:text-red-400'
          >
            Quitar
          </button>
        </div>
      </Campo>
    );
  }

  const resultados = data?.obras ?? [];

  return (
    <Campo label='Obra de teatro en que se basa (opcional)'>
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder='Busca una obra de teatro publicada por su título…'
        maxLength={100}
        className={inputClasses}
      />
      {busqueda.length >= 2 && (
        <div className='overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#17171B]'>
          {isFetching && (
            <p className='px-3 py-2 text-[12px] text-neutral-500'>Buscando…</p>
          )}
          {!isFetching && resultados.length === 0 && (
            <p className='px-3 py-2 text-[12px] text-neutral-500'>
              No hay obras de teatro con ese título.
            </p>
          )}
          {resultados.map((g) => (
            <button
              key={g.id}
              type='button'
              onClick={() => {
                onCambiar(g.id);
                setTitulo(g.titulo);
                setTexto('');
              }}
              className='flex w-full items-center gap-2 border-b border-white/[0.05] px-3 py-2 text-left text-[12.5px] text-neutral-200 last:border-0 hover:bg-white/[0.05]'
            >
              <i className='ti ti-book-2 text-emerald-400' />
              <span className='min-w-0 flex-1 truncate'>{g.titulo}</span>
              <span className='text-[11px] text-neutral-500'>
                u/{g.autor?.nombre_usuario}
              </span>
            </button>
          ))}
        </div>
      )}
    </Campo>
  );
}
