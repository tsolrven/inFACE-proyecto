import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import Button from '@/shared/components/ui/Button';
import { useAnunciosFiltrosStore } from '@/features/announcements/store/anunciosFiltrosStore';
import { useFlairs } from '@/features/announcements/hooks/useFlairs';
import { clasesFlair } from '@/features/announcements/utils/flairColors';
import {
  puedeCrearAnuncio,
  puedeEliminarFlair,
} from '@/features/announcements/utils/permisos';
import AnuncioFormModal from '@/features/announcements/components/AnuncioFormModal';
import AdministrarFlairsModal from '@/features/announcements/components/AdministrarFlairsModal';

const ORDENES = [
  { valor: 'recientes', label: 'Recientes', icono: 'ti-clock' },
  { valor: 'populares', label: 'Más confirmados', icono: 'ti-thumb-up' },
];

// mismo ícono que el sello del anuncio (EncabezadoOficial)
const FILTRO_CARGO = {
  cee: { label: 'CEE', icono: 'ti-users-group' },
  tutor: { label: 'Tutores', icono: 'ti-school' },
};

const PILDORA_ACTIVA =
  'flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80';

// Una sola fila: filtros activos (solo si hay; se eligen desde las tarjetas o
// el panel derecho), el orden y las acciones.
export default function AnnouncementsTopbar({
  carreraId,
  permitirCrear = true,
}) {
  const flairId = useAnunciosFiltrosStore((s) => s.filtros.flair_id);
  const cargo = useAnunciosFiltrosStore((s) => s.filtros.cargo);
  const orden = useAnunciosFiltrosStore((s) => s.filtros.orden);
  const setFiltro = useAnunciosFiltrosStore((s) => s.setFiltro);

  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const location = useLocation();
  const [creando, setCreando] = useState(false);
  const [administrando, setAdministrando] = useState(false);
  const [ordenAbierto, setOrdenAbierto] = useState(false);
  const ordenRef = useRef(null);

  const { data: flairs = [], isSuccess } = useFlairs(carreraId);

  useEffect(() => {
    function onClickOutside(e) {
      if (ordenRef.current && !ordenRef.current.contains(e.target)) {
        setOrdenAbierto(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Si el flair elegido no existe en esta carrera (lo eliminaron o el filtro
  // venía de otra carrera), se quita el filtro
  useEffect(() => {
    if (isSuccess && flairId && !flairs.some((f) => f.id === flairId)) {
      setFiltro('flair_id', null);
    }
  }, [isSuccess, flairs, flairId, setFiltro]);

  const cargoActivo = FILTRO_CARGO[cargo];
  const flairActivo = flairs.find((f) => f.id === flairId);
  const ordenActual = ORDENES.find((o) => o.valor === orden) ?? ORDENES[0];

  // Publicado: se abre su detalle como modal sobre el feed (igual que AnuncioCard)
  function alCrear(anuncio) {
    setCreando(false);
    navigate(`/anuncios-oficiales/${anuncio.id}`, {
      state: { backgroundLocation: location },
    });
  }

  return (
    <div className='mb-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
          {cargoActivo && (
            <button
              type='button'
              onClick={() => setFiltro('cargo', null)}
              aria-label={`Quitar filtro: ${cargoActivo.label}`}
              title='Quitar filtro'
              className={`${PILDORA_ACTIVA} border border-amber-400/30 bg-amber-400/10 text-amber-400`}
            >
              <i className={`ti ${cargoActivo.icono} text-[13px]`} />
              {cargoActivo.label}
              <i className='ti ti-x text-[12px]' />
            </button>
          )}
          {flairActivo && (
            <button
              type='button'
              onClick={() => setFiltro('flair_id', null)}
              aria-label={`Quitar filtro: ${flairActivo.nombre}`}
              title='Quitar filtro'
              className={`${PILDORA_ACTIVA} ${clasesFlair(flairActivo.color)}`}
            >
              {flairActivo.nombre}
              <i className='ti ti-x text-[12px]' />
            </button>
          )}
        </div>

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
                    className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12.5px] transition-colors hover:bg-white/[0.04] ${orden === o.valor ? 'text-amber-400' : 'text-neutral-300'}`}
                  >
                    <i className={`ti ${o.icono} text-[15px]`} />
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {permitirCrear && puedeCrearAnuncio(usuario, carreraId) && (
          <Button
            variant='secondary'
            icon='ti-plus'
            onClick={() => setCreando(true)}
            className='rounded-full! border-white/35! gap-2! text-[13px]! font-semibold! text-neutral-100! enabled:hover:border-amber-400/40! enabled:hover:bg-amber-400/15 enabled:hover:text-amber-300! [&_i]:text-[18px]'
          >
            Nuevo anuncio
          </Button>
        )}

        {permitirCrear && puedeEliminarFlair(usuario, carreraId) && (
          <Button
            variant='secondary'
            icon='ti-tags'
            onClick={() => setAdministrando(true)}
            className='rounded-full! border-white/35! text-neutral-100! enabled:hover:border-amber-400/40! enabled:hover:bg-amber-400/15 enabled:hover:text-amber-300!'
          >
            Flairs
          </Button>
        )}
      </div>

      {creando && (
        <AnuncioFormModal
          carreraId={carreraId}
          onClose={() => setCreando(false)}
          onGuardado={alCrear}
        />
      )}

      {administrando && (
        <AdministrarFlairsModal
          carreraId={carreraId}
          onClose={() => setAdministrando(false)}
        />
      )}
    </div>
  );
}