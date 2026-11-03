import FiltroTipoArchivo from '@/features/materials/components/FiltroTipoArchivo';
import FiltroRamo from '@/shared/components/FiltroRamo';
import Button from '@/shared/components/ui/Button';
import { useFiltrosStore } from '@/features/materials/store/filtrosStore';

export default function FeedTopbar({ carreraId, onAbrirSubida }) {
  const orden = useFiltrosStore((s) => s.filtros.orden);
  const ramoId = useFiltrosStore((s) => s.filtros.ramo_id);
  const setFiltro = useFiltrosStore((s) => s.setFiltro);

  return (
    <div className='mb-3 flex flex-wrap items-center gap-2'>
      <FiltroTipoArchivo />
      <FiltroRamo
        carreraId={carreraId}
        ramoId={ramoId}
        onCambiar={(id) => setFiltro('ramo_id', id)}
      />

      <div className='ml-auto flex gap-1'>
        <button
          type='button'
          onClick={() => setFiltro('orden', 'recientes')}
          className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
            orden === 'recientes'
              ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
              : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
          }`}
        >
          <i className='ti ti-clock text-sm' /> Recientes
        </button>
        <button
          type='button'
          onClick={() => setFiltro('orden', 'populares')}
          className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
            orden === 'populares'
              ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
              : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
          }`}
        >
          <i className='ti ti-flame text-sm' /> Más votados
        </button>
      </div>

      {onAbrirSubida && (
        <Button
          variant='primary'
          icon='ti-upload'
          onClick={onAbrirSubida}
        >
          Subir material
        </Button>
      )}
    </div>
  );
}
