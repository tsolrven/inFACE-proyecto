import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMiPerfil, actualizarMiPerfil } from '@/shared/api/perfil.api';
import { useAuthStore } from '@/shared/auth/authStore';
import Mascota from '@/shared/mascota/Mascota';
import Miniatura from '@/shared/mascota/Miniatura';
import {
  ACCESORIOS,
  ACCESORIO_POR_ID,
  SLOTS,
  accesoriosDeUsuario,
  accesoriosPorDefecto,
  normalizarAccesorios,
} from '@/shared/mascota/catalogo';

export default function EditarPersonaje() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [errorCarga, setErrorCarga] = useState(null);

  useEffect(() => {
    obtenerMiPerfil()
      .then(setPerfil)
      .catch((err) => setErrorCarga(err.message));
  }, []);

  if (errorCarga) {
    return (
      <div className='mx-auto mt-10 max-w-md rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-400'>
        No se pudo cargar tu perfil: {errorCarga}
      </div>
    );
  }
  if (!perfil) {
    return (
      <p className='py-16 text-center text-[13px] text-neutral-500'>
        Cargando…
      </p>
    );
  }
  return (
    <Editor
      perfil={perfil}
      onVolver={() => navigate('/perfil')}
    />
  );
}

function Editor({ perfil, onVolver }) {
  const [seleccion, setSeleccion] = useState(() =>
    accesoriosDeUsuario({ avatar: perfil.avatar, carrera: perfil.carrera }),
  );
  const [slot, setSlot] = useState(SLOTS[0].id);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const inicial = JSON.stringify(
    accesoriosDeUsuario({ avatar: perfil.avatar, carrera: perfil.carrera }),
  );
  const huboCambios = JSON.stringify(seleccion) !== inicial;

  const porDefecto = normalizarAccesorios(
    accesoriosPorDefecto(perfil.carrera?.codigo),
  );
  const delSlot = ACCESORIOS.filter((a) => a.slot === slot);
  const hayEnSlot = seleccion.some((x) => ACCESORIO_POR_ID[x].slot === slot);

  function elegir(id) {
    setSeleccion((actual) => {
      const sinElSlot = actual.filter((x) => ACCESORIO_POR_ID[x].slot !== slot);
      if (actual.includes(id)) return sinElSlot;
      return normalizarAccesorios([...sinElSlot, id]);
    });
  }

  function quitarDelSlot() {
    setSeleccion((actual) =>
      actual.filter((x) => ACCESORIO_POR_ID[x].slot !== slot),
    );
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const actualizado = await actualizarMiPerfil({
        avatar: { accesorios: seleccion },
      });
      const { usuario, actualizarUsuario } = useAuthStore.getState();
      if (usuario)
        actualizarUsuario({ ...usuario, avatar: actualizado.avatar });
      onVolver();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el personaje');
      setGuardando(false);
    }
  }

  return (
    <div className='mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7'>
      <div className='mb-5 flex items-center gap-3'>
        <button
          type='button'
          onClick={onVolver}
          className='flex items-center gap-1.5 rounded-[10px] border border-white/[0.08] px-3 py-1.5 text-[12.5px] font-medium text-neutral-400 transition hover:border-white/[0.2] hover:text-neutral-100'
        >
          <i className='ti ti-arrow-left text-[14px]' /> Volver
        </button>
        <h1 className='flex-1 text-[18px] font-bold text-neutral-100 sm:text-[20px]'>
          Editar personaje
        </h1>
        <button
          type='button'
          disabled={guardando || !huboCambios}
          onClick={guardar}
          className='rounded-[10px] bg-pink-500 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-40'
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {error && (
        <div className='mb-4 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[12.5px] text-red-400'>
          {error}
        </div>
      )}

      <div className='grid gap-5 md:grid-cols-[340px_1fr]'>
        <div className='md:sticky md:top-4 md:self-start'>
          <div
            className='flex flex-col items-center rounded-3xl border border-white/[0.07] px-6 pb-5 pt-7'
            style={{
              background:
                'radial-gradient(90% 70% at 50% 25%, rgba(244,114,182,0.14) 0%, rgba(167,139,250,0.07) 45%, rgba(23,23,27,0) 80%), #17171B',
            }}
          >
            <Mascota
              accesorios={seleccion}
              className='w-[230px] sm:w-[260px]'
            />
            <div className='mt-1 text-[13px] font-semibold text-neutral-300'>
              u/{perfil.nombre_usuario}
            </div>
            <div className='mt-4 flex w-full gap-2'>
              <button
                type='button'
                onClick={() => setSeleccion(porDefecto)}
                className='flex-1 rounded-[10px] border border-white/[0.09] px-3 py-2 text-[12px] font-medium text-neutral-300 transition hover:border-white/[0.25] hover:text-neutral-100'
              >
                {perfil.carrera ? 'El de mi carrera' : 'Sin accesorios'}
              </button>
              {perfil.carrera && (
                <button
                  type='button'
                  onClick={() => setSeleccion([])}
                  className='flex-1 rounded-[10px] border border-white/[0.09] px-3 py-2 text-[12px] font-medium text-neutral-300 transition hover:border-white/[0.25] hover:text-neutral-100'
                >
                  Quitar todo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className='min-w-0 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#1E1E24]'>
          <div className='flex overflow-x-auto border-b border-white/[0.07] px-2'>
            {SLOTS.map((s) => {
              const activo = s.id === slot;
              const puesto = seleccion.some(
                (x) => ACCESORIO_POR_ID[x].slot === s.id,
              );
              return (
                <button
                  key={s.id}
                  type='button'
                  onClick={() => setSlot(s.id)}
                  className={`-mb-px flex flex-shrink-0 items-center gap-1.5 border-b-2 px-4 py-3.5 text-[13px] font-medium transition ${
                    activo
                      ? 'border-pink-500 text-pink-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-200'
                  }`}
                >
                  <i className={`ti ${s.icon} text-[16px]`} />
                  {s.label}
                  {puesto && (
                    <span className='h-1.5 w-1.5 rounded-full bg-pink-500' />
                  )}
                </button>
              );
            })}
          </div>

          <div className='grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 sm:p-5'>
            <button
              type='button'
              onClick={quitarDelSlot}
              aria-pressed={!hayEnSlot}
              title='Sin accesorio'
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border text-[11.5px] transition ${
                !hayEnSlot
                  ? 'border-pink-500 bg-pink-500/10 text-pink-300'
                  : 'border-white/[0.08] bg-[#17171B] text-neutral-500 hover:border-white/[0.25]'
              }`}
            >
              <i className='ti ti-ban text-[26px]' />
              Nada
            </button>

            {delSlot.map((a) => {
              const activo = seleccion.includes(a.id);
              return (
                <button
                  key={a.id}
                  type='button'
                  onClick={() => elegir(a.id)}
                  aria-pressed={activo}
                  title={a.label}
                  className={`flex aspect-square items-center justify-center rounded-2xl border bg-[#e9e6ef] transition ${
                    activo
                      ? 'border-pink-500 ring-[3px] ring-pink-500/35'
                      : 'border-transparent hover:border-pink-400/60'
                  }`}
                >
                  <Miniatura
                    accesorio={a}
                    tam={96}
                  />
                </button>
              );
            })}
          </div>

          <p className='px-5 pb-5 text-[11.5px] text-neutral-600'>
            Un accesorio por categoría: al elegir otro, reemplaza al anterior.
          </p>
        </div>
      </div>
    </div>
  );
}
