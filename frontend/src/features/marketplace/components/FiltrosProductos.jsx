import { inputClasses } from '@/shared/components/form/inputClasses';
import {
  CATEGORIAS,
  CONDICIONES,
  ESTADOS,
  ORDENES,
  FILTROS_INICIALES,
  conPuntos,
  soloDigitos,
} from '@/features/marketplace/utils/catalogo';

const chip = (activo) =>
  `flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
    activo
      ? 'border border-white/[0.12] bg-[#1E1E24] text-neutral-100'
      : 'border border-transparent text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
  }`;

const SELECT = `${inputClasses} !w-auto !py-1.5 !text-[12px]`;

export default function FiltrosProductos({
  filtros,
  onCambiar,
  onLimpiar,
  conEstado = true,
}) {
  const hayFiltros =
    filtros.categoria ||
    filtros.condicion ||
    filtros.precio_min !== '' ||
    filtros.precio_max !== '' ||
    filtros.busqueda ||
    (conEstado && filtros.estado !== FILTROS_INICIALES.estado) ||
    filtros.orden !== 'recientes';

  return (
    <div className='mb-3 flex flex-col gap-2'>
      <div className='-mx-1 flex gap-1 overflow-x-auto px-1 pb-1'>
        <button
          type='button'
          onClick={() => onCambiar('categoria', null)}
          className={chip(!filtros.categoria)}
        >
          Todo
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type='button'
            onClick={() => onCambiar('categoria', c.id)}
            className={chip(filtros.categoria === c.id)}
          >
            <i className={`ti ${c.icono} text-[13px]`} /> {c.label}
          </button>
        ))}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <select
          aria-label='Ordenar por'
          value={filtros.orden}
          onChange={(e) => onCambiar('orden', e.target.value)}
          className={SELECT}
        >
          {ORDENES.map((o) => (
            <option
              key={o.valor}
              value={o.valor}
            >
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label='Condición'
          value={filtros.condicion}
          onChange={(e) => onCambiar('condicion', e.target.value)}
          className={SELECT}
        >
          <option value=''>Cualquier condición</option>
          {CONDICIONES.map((c) => (
            <option
              key={c.id}
              value={c.id}
            >
              {c.label}
            </option>
          ))}
        </select>
        {conEstado && (
          <select
            aria-label='Estado'
            value={filtros.estado}
            onChange={(e) => onCambiar('estado', e.target.value)}
            className={SELECT}
          >
            <option value=''>Todos los estados</option>
            {ESTADOS.map((e) => (
              <option
                key={e.id}
                value={e.id}
              >
                {e.label}
              </option>
            ))}
          </select>
        )}
        <div className='flex items-center gap-1.5'>
          <input
            type='text'
            inputMode='numeric'
            aria-label='Precio mínimo'
            placeholder='Mín $'
            value={conPuntos(filtros.precio_min)}
            onChange={(e) =>
              onCambiar('precio_min', soloDigitos(e.target.value))
            }
            className={`${inputClasses} !w-[96px] !py-1.5 !text-[12px]`}
          />
          <span className='text-neutral-600'>–</span>
          <input
            type='text'
            inputMode='numeric'
            aria-label='Precio máximo'
            placeholder='Máx $'
            value={conPuntos(filtros.precio_max)}
            onChange={(e) =>
              onCambiar('precio_max', soloDigitos(e.target.value))
            }
            className={`${inputClasses} !w-[96px] !py-1.5 !text-[12px]`}
          />
        </div>
        {hayFiltros && (
          <button
            type='button'
            onClick={onLimpiar}
            className='flex items-center gap-1 text-[12px] font-medium text-pink-400 hover:underline'
          >
            <i className='ti ti-x text-[12px]' /> Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
