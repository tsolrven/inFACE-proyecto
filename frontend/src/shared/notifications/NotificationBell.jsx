import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificaciones } from './useNotificaciones';

const ICONOS = {
  postulacion_recibida: 'ti-user-plus',
  postulacion_aceptada: 'ti-circle-check',
  postulacion_aceptada_creador: 'ti-user-check',
  postulacion_rechazada: 'ti-circle-x',
  integrante_expulsado: 'ti-user-minus',
  integrante_salio: 'ti-door-exit',
  entregables_actualizados: 'ti-trophy',
  proyecto_eliminado: 'ti-trash',
  sancion: 'ti-alert-triangle',
};

function hace(fecha) {
  const seg = Math.max(0, (Date.now() - new Date(fecha).getTime()) / 1000);
  if (seg < 60) return 'ahora';
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  return `hace ${Math.floor(seg / 86400)} d`;
}

export default function NotificationBell() {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { items, noLeidas, cargando, leer, leerTodas, eliminar } =
    useNotificaciones();

  useEffect(() => {
    function fuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  function abrir(n) {
    if (!n.leida) leer(n.id);
    setAbierto(false);
    if (n.enlace) navigate(n.enlace);
  }

  return (
    <div
      className='relative'
      ref={ref}
    >
      <button
        type='button'
        title='Notificaciones'
        onClick={() => setAbierto((v) => !v)}
        className='relative flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] border border-white/[0.07] bg-[#1E1E24] text-neutral-400 transition-colors hover:text-neutral-100'
      >
        <i className='ti ti-bell text-base' />
        {noLeidas > 0 && (
          <span className='absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white'>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className='fixed inset-x-3 top-[60px] z-[400] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_40px_rgba(0,0,0,0.5)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[44px] sm:w-[360px]'>
          <div className='flex items-center justify-between border-b border-white/[0.07] px-4 py-3'>
            <span className='text-[13px] font-semibold text-neutral-100'>
              Notificaciones
            </span>
            {noLeidas > 0 && (
              <button
                type='button'
                onClick={() => leerTodas()}
                className='text-[11.5px] font-medium text-pink-400 transition-colors hover:text-pink-300'
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className='max-h-[400px] overflow-y-auto'>
            {cargando ? (
              <p className='px-4 py-8 text-center text-[12.5px] text-neutral-600'>
                Cargando...
              </p>
            ) : items.length === 0 ? (
              <div className='px-4 py-10 text-center'>
                <i className='ti ti-bell-off text-[26px] text-neutral-700' />
                <p className='mt-2 text-[12.5px] text-neutral-600'>
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03] ${n.leida ? '' : 'bg-pink-500/[0.05]'
                    }`}
                >
                  <button
                    type='button'
                    onClick={() => abrir(n)}
                    className='flex min-w-0 flex-1 items-start gap-3 text-left'
                  >
                    <span className='mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-pink-400'>
                      <i
                        className={`ti ${ICONOS[n.tipo] ?? 'ti-bell'} text-[15px]`}
                      />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block text-[12.5px] font-semibold text-neutral-100'>
                        {n.titulo}
                      </span>
                      {n.mensaje && (
                        <span className='mt-0.5 block text-[12px] leading-snug text-neutral-500'>
                          {n.mensaje}
                        </span>
                      )}
                      <span className='mt-1 block text-[11px] text-neutral-600'>
                        {hace(n.creado_en)}
                      </span>
                    </span>
                  </button>
                  <div className='flex flex-col items-center gap-2'>
                    {!n.leida && (
                      <span className='mt-1 h-2 w-2 rounded-full bg-pink-500' />
                    )}
                    <button
                      type='button'
                      title='Eliminar'
                      onClick={() => eliminar(n.id)}
                      className='text-neutral-700 opacity-0 transition hover:text-red-400 group-hover:opacity-100'
                    >
                      <i className='ti ti-x text-[13px]' />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}