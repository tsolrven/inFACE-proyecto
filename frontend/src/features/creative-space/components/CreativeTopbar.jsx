import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';
import { useCreativeFiltrosStore } from '@/features/creative-space/store/creativeFiltrosStore';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import { rutas } from '@/features/creative-space/utils/espacios';

const ORDENES = [
  { valor: 'recientes', label: 'Recientes', icono: 'ti-clock' },
  { valor: 'populares', label: 'Más votadas', icono: 'ti-flame' },
];

export default function CreativeTopbar({
  tiposFiltro = null,
  crearTipos = null,
  textoCrear = 'Compartir mi arte',
  espacioId = null,
}) {
  const filtros = useCreativeFiltrosStore((s) => s.filtros);
  const setFiltro = useCreativeFiltrosStore((s) => s.setFiltro);
  const navigate = useNavigate();

  const chip = (activo) =>
    `flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      activo
        ? 'border border-white/[0.12] bg-[#1E1E24] text-neutral-100'
        : 'border border-transparent text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
    }`;

  function publicar() {
    navigate(
      crearTipos?.length === 1
        ? rutas.nueva(crearTipos[0])
        : rutas.nueva(null, espacioId),
    );
  }

  return (
    <div className='mb-3 flex flex-col gap-2'>
      {tiposFiltro && tiposFiltro.length > 1 && (
        <div className='flex flex-wrap gap-1'>
          <button
            type='button'
            onClick={() => setFiltro('tipo', null)}
            className={chip(filtros.tipo === null)}
          >
            Todo
          </button>
          {tiposFiltro.map((id) => {
            const t = TIPO_POR_ID[id];
            return (
              <button
                key={id}
                type='button'
                onClick={() => setFiltro('tipo', id)}
                className={chip(filtros.tipo === id)}
              >
                <i
                  className={`ti ${t.icono} text-sm`}
                  style={{ color: t.color }}
                />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative min-w-[160px] flex-1'>
          <i className='ti ti-search pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-neutral-600' />
          <input
            value={filtros.busqueda}
            onChange={(e) => setFiltro('busqueda', e.target.value)}
            placeholder='Buscar por título...'
            maxLength={100}
            className='h-[34px] w-full rounded-[10px] border border-white/[0.07] bg-[#17171B] pl-8 pr-3 text-[12.5px] text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-white/[0.18]'
          />
        </div>

        <div className='flex gap-1'>
          {ORDENES.map((o) => (
            <button
              key={o.valor}
              type='button'
              onClick={() => setFiltro('orden', o.valor)}
              className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filtros.orden === o.valor
                  ? 'border border-white/[0.07] bg-[#1E1E24] text-neutral-100'
                  : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
            >
              <i className={`ti ${o.icono} text-sm`} /> {o.label}
            </button>
          ))}
        </div>

        {crearTipos?.length > 0 && (
          <Button
            variant='primary'
            icon='ti-plus'
            onClick={publicar}
          >
            {textoCrear}
          </Button>
        )}
      </div>

      {filtros.hashtag && (
        <div className='flex items-center gap-2 text-[12px] text-neutral-400'>
          Filtrando por
          <button
            type='button'
            onClick={() => setFiltro('hashtag', null)}
            className='flex items-center gap-1 rounded-full bg-blue-400/10 px-2.5 py-1 font-semibold text-blue-400 hover:bg-blue-400/20'
          >
            #{filtros.hashtag} <i className='ti ti-x text-[11px]' />
          </button>
        </div>
      )}
    </div>
  );
}
