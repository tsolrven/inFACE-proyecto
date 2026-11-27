import { useEffect, useState } from 'react';
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
  cee: { label: 'CEE', icono: 'ti-building-community' },
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

  const { data: flairs = [], isSuccess } = useFlairs(carreraId);

  // Si el flair elegido no existe en esta carrera (lo eliminaron o el filtro
  // venía de otra carrera), se quita el filtro
  useEffect(() => {
    if (isSuccess && flairId && !flairs.some((f) => f.id === flairId)) {
      setFiltro('flair_id', null);
    }
  }, [isSuccess, flairs, flairId, setFiltro]);

  const cargoActivo = FILTRO_CARGO[cargo];
  const flairActivo = flairs.find((f) => f.id === flairId);

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

        <div className='ml-auto flex gap-1'>
          {ORDENES.map((o) => (
            <button
              key={o.valor}
              type='button'
              onClick={() => setFiltro('orden', o.valor)}
              className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${orden === o.valor
                  ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
                  : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
                }`}
            >
              <i className={`ti ${o.icono} text-sm`} /> {o.label}
            </button>
          ))}
        </div>

        {permitirCrear && puedeCrearAnuncio(usuario, carreraId) && (
          <Button
            variant='primary'
            icon='ti-plus'
            onClick={() => setCreando(true)}
          >
            Nuevo anuncio
          </Button>
        )}

        {permitirCrear && puedeEliminarFlair(usuario, carreraId) && (
          <Button
            variant='secondary'
            icon='ti-tags'
            onClick={() => setAdministrando(true)}
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