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
  { valor: 'populares', label: 'Más votados', icono: 'ti-flame' },
];

export default function AnnouncementsTopbar({ carreraId }) {
  const flairId = useAnunciosFiltrosStore((s) => s.filtros.flair_id);
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
        <div className='ml-auto flex gap-1'>
          {ORDENES.map((o) => (
            <button
              key={o.valor}
              type='button'
              onClick={() => setFiltro('orden', o.valor)}
              className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
                orden === o.valor
                  ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
                  : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
            >
              <i className={`ti ${o.icono} text-sm`} /> {o.label}
            </button>
          ))}
        </div>

        {puedeCrearAnuncio(usuario, carreraId) && (
          <Button
            variant='primary'
            icon='ti-plus'
            onClick={() => setCreando(true)}
          >
            Nuevo anuncio
          </Button>
        )}

        {puedeEliminarFlair(usuario, carreraId) && (
          <Button
            variant='secondary'
            icon='ti-tags'
            onClick={() => setAdministrando(true)}
          >
            Flairs
          </Button>
        )}
      </div>

      {flairs.length > 0 && (
        <div className='mt-2.5 flex flex-wrap gap-1.5'>
          <button
            type='button'
            onClick={() => setFiltro('flair_id', null)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              !flairId
                ? 'bg-white/[0.12] text-neutral-100'
                : 'bg-white/[0.04] text-neutral-500 hover:text-neutral-200'
            }`}
          >
            Todos
          </button>
          {flairs.map((f) => (
            <button
              key={f.id}
              type='button'
              onClick={() =>
                setFiltro('flair_id', flairId === f.id ? null : f.id)
              }
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity ${clasesFlair(f.color)} ${
                flairId && flairId !== f.id
                  ? 'opacity-40 hover:opacity-80'
                  : 'ring-1 ring-current/40'
              }`}
            >
              {f.nombre}
            </button>
          ))}
        </div>
      )}

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
