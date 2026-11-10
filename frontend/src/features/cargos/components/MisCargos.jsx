import {
  ETIQUETA_TIPO,
  formatearFechaCargo,
} from '@/features/cargos/utils/cargosUi';

// Cargos vigentes del usuario (usuario.cargos). El backend es la autoridad:
// la página vuelve a pedir el usuario al abrirse para no mostrar uno vencido.
export default function MisCargos({ cargos = [], carreras = [] }) {
  if (cargos.length === 0) {
    return (
      <p className='text-[12.5px] text-neutral-500'>
        Aún no tienes cargos vigentes.
      </p>
    );
  }

  return (
    <ul className='flex flex-col gap-2'>
      {cargos.map((c) => {
        const carrera = carreras.find((x) => x.id === c.carrera_id);
        return (
          <li
            key={`${c.tipo}-${c.carrera_id}`}
            className='flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-white/[0.07] bg-[#111114] px-3 py-2.5'
          >
            <div className='min-w-0'>
              <div className='text-[13px] font-semibold text-neutral-100'>
                {ETIQUETA_TIPO[c.tipo] ?? c.tipo}
              </div>
              <div className='truncate text-[11.5px] text-neutral-500'>
                {carrera?.nombre ?? 'Carrera'}
              </div>
            </div>
            <span className='text-[11.5px] text-neutral-400'>
              Vigente hasta {formatearFechaCargo(c.hasta)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}