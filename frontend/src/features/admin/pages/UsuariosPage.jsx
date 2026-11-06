import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { mensajeDeError } from '@/shared/lib/errores';
import FilaUsuario from '@/features/admin/components/FilaUsuario';
import { useBuscarUsuarios } from '@/features/admin/hooks/useUsuarios';
import {
  BUSQUEDA_MIN,
  BUSQUEDA_MAX,
} from '@/features/admin/utils/usuarioUi';

export default function UsuariosPage() {
  const [texto, setTexto] = useState('');
  const [consulta, setConsulta] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  const { data, isPending, isError, error, refetch } =
    useBuscarUsuarios(consulta);
  const buscado = consulta !== '';
  const items = data?.items ?? [];

  function buscar(e) {
    e.preventDefault();
    const q = texto.trim();
    if (q.length < BUSQUEDA_MIN) {
      setErrorLocal(`Escribe al menos ${BUSQUEDA_MIN} caracteres.`);
      return;
    }
    setErrorLocal(null);
    setConsulta(q);
  }

  return (
    <div className='mx-auto w-full max-w-[820px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>Usuarios</h1>
      <p className='mb-6 text-[13.5px] leading-relaxed text-neutral-400'>
        Busca a una persona por su nombre de usuario o su nombre completo.
      </p>

      <form
        onSubmit={buscar}
        noValidate
        className='mb-2 flex items-center gap-2'
      >
        <input
          type='search'
          value={texto}
          maxLength={BUSQUEDA_MAX}
          onChange={(e) => {
            setTexto(e.target.value);
            setErrorLocal(null);
          }}
          placeholder='Nombre de usuario o nombre completo'
          aria-label='Buscar usuario'
          className={inputClasses}
        />
        <Button
          type='submit'
          variant='primary'
          icon='ti-search'
          loading={buscado && isPending && !isError}
        >
          Buscar
        </Button>
      </form>

      {errorLocal && (
        <p className='mb-4 text-[11.5px] text-red-400'>{errorLocal}</p>
      )}

      {!buscado && (
        <p className='mt-10 text-center text-xs text-neutral-600'>
          Escribe al menos {BUSQUEDA_MIN} caracteres y presiona Buscar.
        </p>
      )}

      {isError && (
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
          {data.hay_mas && (
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