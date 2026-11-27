import { useMemo } from 'react';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { useRamosCarrera } from '@/shared/hooks/useRamos';
import { PILDORA_QUITAR } from '@/shared/components/layout/pildorasFiltro';

// Píldora del ramo filtrado en la barra de un feed (foro, materiales), con el
// color del ramo y × para quitarlo. El nombre sale de los ramos de la carrera
// (la misma consulta del selector de ramo, ya en caché).
export default function PildoraRamoActiva({ carreraId, ramoId, onQuitar }) {
  const { data: ramosPorSemestre } = useRamosCarrera(carreraId, {
    enabled: !!ramoId,
  });

  const ramo = useMemo(
    () =>
      Object.values(ramosPorSemestre ?? {})
        .flat()
        .find((r) => r.id === ramoId) ?? null,
    [ramosPorSemestre, ramoId],
  );

  if (!ramo) return null;
  const color = colorPorRamo(ramo.id);

  return (
    <button
      type='button'
      onClick={onQuitar}
      aria-label={`Quitar filtro: ${ramo.nombre}`}
      title='Quitar filtro'
      className={`${PILDORA_QUITAR} max-w-[220px]`}
      style={{ background: `${color}22`, color }}
    >
      <span className='truncate'>{ramo.nombre}</span>
      <i className='ti ti-x flex-shrink-0 text-[12px]' />
    </button>
  );
}