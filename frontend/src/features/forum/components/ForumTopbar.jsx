import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltroRamo from '@/shared/components/FiltroRamo';
import Button from '@/shared/components/ui/Button';
import HiloFormModal from '@/features/forum/components/HiloFormModal';
import { useForumFiltrosStore } from '@/features/forum/store/forumFiltrosStore';

const ORDENES = [
  { valor: 'recientes', label: 'Recientes', icono: 'ti-clock' },
  { valor: 'populares', label: 'Más votados', icono: 'ti-flame' },
];

export default function ForumTopbar({ carreraId }) {
  const ramoId = useForumFiltrosStore((s) => s.filtros.ramo_id);
  const orden = useForumFiltrosStore((s) => s.filtros.orden);
  const setFiltro = useForumFiltrosStore((s) => s.setFiltro);

  const navigate = useNavigate();
  const location = useLocation();
  const [creando, setCreando] = useState(false);

  // Publicado: se abre su detalle como modal sobre el feed (igual que HiloCard)
  function alCrear(hilo) {
    setCreando(false);
    navigate(`/foro-por-ramos/${hilo.id}`, {
      state: { backgroundLocation: location },
    });
  }

  return (
    <div className='mb-3 flex flex-wrap items-center gap-2'>
      <FiltroRamo
        carreraId={carreraId}
        ramoId={ramoId}
        onCambiar={(id) => setFiltro('ramo_id', id)}
      />

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

      <Button
        variant='primary'
        icon='ti-plus'
        disabled={!carreraId}
        onClick={() => setCreando(true)}
      >
        Nuevo hilo
      </Button>

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
