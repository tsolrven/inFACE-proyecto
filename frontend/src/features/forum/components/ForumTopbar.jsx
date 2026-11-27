import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FiltroRamo from '@/shared/components/FiltroRamo';
import FiltroEstadoHilo from '@/features/forum/components/FiltroEstadoHilo';
import Button from '@/shared/components/ui/Button';
import HiloFormModal from '@/features/forum/components/HiloFormModal';
import { useForumFiltrosStore } from '@/features/forum/store/forumFiltrosStore';
import { useAuthStore } from '@/shared/auth/authStore';
import { puedeEscribir } from '@/shared/auth/roles';

const ORDENES = [
  { valor: 'recientes', label: 'Recientes', icono: 'ti-clock' },
  { valor: 'populares', label: 'Más votados', icono: 'ti-flame' },
];

export default function ForumTopbar({ carreraId, permitirCrear = true }) {
  const ramoId = useForumFiltrosStore((s) => s.filtros.ramo_id);
  const orden = useForumFiltrosStore((s) => s.filtros.orden);
  const setFiltro = useForumFiltrosStore((s) => s.setFiltro);
  const usuario = useAuthStore((s) => s.usuario);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [creando, setCreando] = useState(
    () =>
      searchParams.get('crear') === 'hilo' &&
      permitirCrear &&
      puedeEscribir(usuario),
  );
  const [ordenAbierto, setOrdenAbierto] = useState(false);
  const ordenRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('crear') !== 'hilo') return;
    const params = new URLSearchParams(searchParams);
    params.delete('crear');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ordenRef.current && !ordenRef.current.contains(e.target)) {
        setOrdenAbierto(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Publicado: se abre su detalle como modal sobre el feed (igual que HiloCard)
  function alCrear(hilo) {
    setCreando(false);
    navigate(`/foro-por-ramos/${hilo.id}`, {
      state: { backgroundLocation: location },
    });
  }

  const ordenActual = ORDENES.find((o) => o.valor === orden) ?? ORDENES[0];

  return (
    <div className='mb-3 flex flex-wrap items-center gap-2'>
      <FiltroRamo
        carreraId={carreraId}
        ramoId={ramoId}
        onCambiar={(id) => setFiltro('ramo_id', id)}
      />
      <FiltroEstadoHilo />

      <div className='ml-auto'>
        <div
          className='relative'
          ref={ordenRef}
        >
          <button
            type='button'
            onClick={() => setOrdenAbierto((abierto) => !abierto)}
            aria-expanded={ordenAbierto}
            aria-haspopup='true'
            className='flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border border-white/35 px-3 text-[12.5px] font-medium text-neutral-100 transition-colors hover:border-white/60 hover:bg-white/[0.08] hover:text-white'
          >
            <i className={`ti ${ordenActual.icono} text-sm`} />
            {ordenActual.label}
            <i
              className={`ti ti-chevron-down text-xs transition-transform ${ordenAbierto ? 'rotate-180' : ''}`}
            />
          </button>

          {ordenAbierto && (
            <div className='absolute left-0 top-[calc(100%+6px)] z-[450] w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
              {ORDENES.map((o) => (
                <button
                  key={o.valor}
                  type='button'
                  onClick={() => {
                    setFiltro('orden', o.valor);
                    setOrdenAbierto(false);
                  }}
                  aria-pressed={orden === o.valor}
                  className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12.5px] transition-colors hover:bg-white/[0.04] ${orden === o.valor ? 'text-emerald-400' : 'text-neutral-300'}`}
                >
                  <i className={`ti ${o.icono} text-[15px]`} />
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {permitirCrear && puedeEscribir(usuario) && (
        <Button
          variant='secondary'
          icon='ti-plus'
          disabled={!carreraId}
          onClick={() => setCreando(true)}
          className='rounded-full! border-white/35! gap-2! text-[13px]! font-semibold! text-neutral-100! enabled:hover:border-emerald-400/40! enabled:hover:bg-emerald-400/15 enabled:hover:text-emerald-300! [&_i]:text-[18px]'
        >
          Nuevo hilo
        </Button>
      )}

      {creando && (
        <HiloFormModal
          carreraId={carreraId}
          ramoInicial={ramoId}
          onClose={() => setCreando(false)}
          onGuardado={alCrear}
        />
      )}
    </div>
  );
}
