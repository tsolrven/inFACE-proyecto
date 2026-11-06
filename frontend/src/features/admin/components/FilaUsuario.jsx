import {
  ROL_LABEL,
  ESTADO_CUENTA_LABEL,
  ESTADO_CUENTA_BADGE,
} from '@/features/admin/utils/usuarioUi';

// Una fila de resultado de búsqueda de usuarios.
export default function FilaUsuario({ usuario }) {
  const {
    nombre_usuario,
    nombre_completo,
    rol,
    carreras,
    estado_cuenta,
  } = usuario;

  return (
    <div className='flex items-start justify-between gap-3 rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4'>
      <div className='min-w-0'>
        <p className='truncate text-[13.5px] font-semibold text-neutral-100'>
          @{nombre_usuario}
        </p>
        {nombre_completo && (
          <p className='truncate text-[12.5px] text-neutral-400'>
            {nombre_completo}
          </p>
        )}
        <p className='mt-1 truncate text-[11.5px] text-neutral-500'>
          {carreras.length > 0
            ? carreras.map((c) => c.nombre).join(' · ')
            : 'Sin carrera'}
        </p>
      </div>

      <div className='flex flex-shrink-0 flex-wrap justify-end gap-1.5'>
        {rol !== 'estudiante' && (
          <span className='rounded-full bg-pink-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-pink-400'>
            {ROL_LABEL[rol] ?? rol}
          </span>
        )}
        {ESTADO_CUENTA_LABEL[estado_cuenta] && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_CUENTA_BADGE[estado_cuenta]}`}
          >
            {ESTADO_CUENTA_LABEL[estado_cuenta]}
          </span>
        )}
      </div>
    </div>
  );
}