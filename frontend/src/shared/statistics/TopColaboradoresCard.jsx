import RpCard from '@/shared/components/layout/RpCard';
import { useTopColaboradores } from '@/shared/statistics/useEstadisticas';

const COLORES_COLABORADOR = [
  'bg-amber-400/10 text-amber-400',
  'bg-blue-400/10 text-blue-400',
  'bg-emerald-400/10 text-emerald-400',
  'bg-violet-400/10 text-violet-400',
  'bg-rose-400/10 text-rose-400',
];

function inicialesDe(nombreUsuario) {
  return (nombreUsuario || '??').slice(0, 2).toUpperCase();
}

function formatearPuntos(puntos) {
  return puntos >= 1000
    ? `${(puntos / 1000).toFixed(1)}k pts`
    : `${puntos} pts`;
}

// tipo: 'apunte' | 'hilo' (anuncios no tiene ranking)
// etiquetaModulo (opcional): se agrega al título cuando el mismo panel muestra
// estadísticas de distintos módulos (comunidades)
export default function TopColaboradoresCard({
  tipo,
  carreraId,
  etiquetaModulo,
}) {
  const {
    data: colaboradores = [],
    isPending,
    isError,
  } = useTopColaboradores(tipo, carreraId);

  return (
    <RpCard
      title={
        etiquetaModulo
          ? `Top colaboradores · ${etiquetaModulo}`
          : 'Top colaboradores'
      }
      icon='ti-star'
    >
      {isPending && carreraId ? (
        <p className='text-[11.5px] text-neutral-600'>Cargando...</p>
      ) : isError ? (
        <p className='text-[11.5px] text-neutral-600'>
          No se pudo cargar el ranking.
        </p>
      ) : colaboradores.length === 0 ? (
        <p className='text-[11.5px] text-neutral-600'>
          Aún no hay colaboradores con votos en esta carrera.
        </p>
      ) : (
        <div className='flex flex-col'>
          {colaboradores.map(({ usuario_id, nombre_usuario, puntos }, i) => (
            <div
              key={usuario_id}
              className='flex items-center gap-2 py-1.5'
            >
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${COLORES_COLABORADOR[i % COLORES_COLABORADOR.length]
                  }`}
              >
                {inicialesDe(nombre_usuario)}
              </div>
              <span className='flex-1 text-[12px] text-neutral-400'>
                u/{nombre_usuario}
              </span>
              <span className='text-[11px] font-semibold text-pink-500'>
                {formatearPuntos(puntos)}
              </span>
            </div>
          ))}
        </div>
      )}
    </RpCard>
  );
}