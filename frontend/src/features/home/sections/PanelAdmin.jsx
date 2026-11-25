import { Link } from 'react-router-dom';
import { obtenerResumenAdmin } from '@/features/admin/api/resumen.api';
import { useVistaPrevia } from '@/features/home/hooks/useVistaPrevia';

const TARJETAS = [
  {
    clave: 'reportes_pendientes',
    to: '/admin/reportes',
    icon: 'ti-flag',
    singular: 'contenido reportado',
    plural: 'contenidos reportados',
  },
  {
    clave: 'solicitudes_pendientes',
    to: '/admin/solicitudes',
    icon: 'ti-id-badge-2',
    singular: 'solicitud de cargo',
    plural: 'solicitudes de cargo',
  },
];

// Solo superadmin (Inicio decide si se muestra). Cada número lleva a su pantalla.
export default function PanelAdmin() {
  const { items: resumen, cargando, error } = useVistaPrevia(
    ['admin-resumen'],
    obtenerResumenAdmin,
  );

  return (
    <section className='rounded-2xl border border-white/[0.07] bg-[#17171B] p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <i className='ti ti-shield-check text-[16px] text-pink-400' />
        <h2 className='text-[13.5px] font-bold text-neutral-200'>
          Administración
        </h2>
      </div>

      {error ? (
        <p className='text-[12px] text-neutral-500'>
          No se pudo cargar el resumen.
        </p>
      ) : (
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
          {TARJETAS.map((t) => {
            const n = resumen?.[t.clave] ?? 0;
            const pendiente = !cargando && n > 0;
            return (
              <Link
                key={t.clave}
                to={t.to}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition hover:-translate-y-0.5 ${pendiente
                    ? 'border-pink-500/30 bg-pink-500/[0.06] hover:border-pink-500/50'
                    : 'border-white/[0.06] bg-[#1E1E24] hover:border-white/[0.14]'
                  }`}
              >
                <i
                  className={`ti ${t.icon} text-[20px] ${pendiente ? 'text-pink-400' : 'text-neutral-500'}`}
                />
                <div className='min-w-0'>
                  <div className='text-[18px] font-bold leading-none text-neutral-100'>
                    {cargando ? '…' : n}
                  </div>
                  <div className='mt-1 text-[11.5px] text-neutral-500'>
                    {n === 1 ? t.singular : t.plural}
                    {!cargando && n === 0 && ' · al día'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}