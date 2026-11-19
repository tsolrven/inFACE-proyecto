import { useRef, useState } from 'react';
import { mensajeDeError } from '@/shared/lib/errores';
import { useBusqueda } from '@/shared/hooks/useBusqueda';
import FilaUsuario from '@/features/admin/components/FilaUsuario';
import { useBuscarUsuarios } from '@/features/admin/hooks/useUsuarios';
import {
  BUSQUEDA_MIN,
  BUSQUEDA_MAX,
} from '@/features/admin/utils/usuarioUi';

// Búsqueda inmediata: se aplica 300 ms después de dejar de escribir y al
// instante al borrar (useBusqueda). "#" es texto normal: no hay hashtags.
const OPCIONES_BUSQUEDA = { min: BUSQUEDA_MIN, hashtags: false };

export default function UsuariosPage() {
  const inputRef = useRef(null);
  const [texto, setTexto] = useState('');
  const consulta = useBusqueda(texto, OPCIONES_BUSQUEDA);

  const { data, isPending, isFetching, isError, error, refetch } =
    useBuscarUsuarios(consulta);
  const buscado = consulta !== '';
  const items = buscado ? (data?.items ?? []) : [];

  function limpiar() {
    setTexto('');
    inputRef.current?.focus();
  }

  return (
    <div className='mx-auto w-full max-w-[820px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>Usuarios</h1>
      <p className='mb-6 text-[13.5px] leading-relaxed text-neutral-400'>
        Busca a una persona por su nombre de usuario o su nombre completo.
      </p>

      <div className='mb-2 flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3 py-2 transition-colors focus-within:border-white/[0.18]'>
        <i
          className={`ti ${buscado && isFetching ? 'ti-loader-2 animate-spin' : 'ti-search'} flex-shrink-0 text-[14px] text-neutral-500`}
        />
        <input
          ref={inputRef}
          type='text'
          value={texto}
          maxLength={BUSQUEDA_MAX}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && texto) {
              e.preventDefault();
              limpiar();
            }
          }}
          placeholder='Nombre de usuario o nombre completo'
          aria-label='Buscar usuario'
          autoComplete='off'
          className='flex-1 bg-transparent text-[13px] text-neutral-100 placeholder-neutral-600 outline-none'
        />
        {texto && (
          <button
            type='button'
            onClick={limpiar}
            aria-label='Borrar búsqueda'
            title='Borrar búsqueda (Esc)'
            className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-200'
          >
            <i className='ti ti-x text-[12px]' />
          </button>
        )}
      </div>

      {!buscado && (
        <p className='mt-10 text-center text-xs text-neutral-600'>
          Escribe al menos {BUSQUEDA_MIN} caracteres para buscar.
        </p>
      )}

      {buscado && isError && (
        <div className='mb-4 mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>{mensajeDeError(error, 'No se pudo realizar la búsqueda.')}</span>
          <button
            type='button'
            onClick={() => refetch()}
            className='flex-shrink-0 font-semibold underline-offset-2 hover:underline'
          >
            Reintentar
          </button>
        </div>
      )}

      {buscado && isPending && !isError && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {buscado && !isPending && !isError && items.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            Sin resultados para «{consulta}»
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            Prueba con otra parte del nombre.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className='mt-4 flex flex-col gap-2.5'>
            {items.map((u) => (
              <FilaUsuario
                key={u.id}
                usuario={u}
              />
            ))}
          </div>
          {data?.hay_mas && (
            <p className='mt-3 text-[11.5px] text-neutral-500'>
              Mostrando los primeros {data.limite} resultados. Escribe más
              letras del nombre para acotar la búsqueda.
            </p>
          )}
        </>
      )}
    </div>
  );
}