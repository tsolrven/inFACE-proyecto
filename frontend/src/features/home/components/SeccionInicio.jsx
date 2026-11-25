import { Link } from 'react-router-dom';

export function SeccionHeader({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  to,
  beta,
}) {
  return (
    <div className='mb-4 flex items-center gap-3'>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${iconBg}`}
      >
        <i className={`ti ${icon} text-[20px] ${iconColor}`} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <h2 className='text-[16px] font-bold text-neutral-100'>{title}</h2>
          {beta && (
            <span className='rounded border border-pink-500/30 bg-pink-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-pink-400'>
              Beta
            </span>
          )}
        </div>
        {subtitle && <p className='text-[12px] text-neutral-500'>{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className='flex flex-shrink-0 items-center gap-1 rounded-full border border-white/[0.08] px-3 py-1.5 text-[12px] font-semibold text-neutral-300 transition hover:border-pink-500/40 hover:text-pink-300'
        >
          Ver todo <i className='ti ti-arrow-right text-[13px]' />
        </Link>
      )}
    </div>
  );
}

export function SeccionVacia({ icon, mensaje }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-[#1E1E24]/60 px-5 py-9 text-center'>
      <i className={`ti ${icon} mb-2 text-4xl text-neutral-700`} />
      <p className='text-[12.5px] text-neutral-500'>{mensaje}</p>
    </div>
  );
}

export function SeccionError() {
  return (
    <SeccionVacia
      icon='ti-alert-triangle'
      mensaje='No se pudo cargar esta sección. Intenta recargar la página.'
    />
  );
}

export function SkeletonCard() {
  return (
    <div className='animate-pulse rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4'>
      <div className='mb-3 h-3.5 w-2/3 rounded bg-white/[0.06]' />
      <div className='mb-2 h-2.5 w-1/3 rounded bg-white/[0.05]' />
      <div className='h-2.5 w-full rounded bg-white/[0.05]' />
    </div>
  );
}