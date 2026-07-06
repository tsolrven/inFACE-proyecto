import { Link } from 'react-router-dom';

export default function PageBanner({
  icon,
  title,
  subtitle,
  searchPlaceholder = 'Buscar...',
  breadcrumb = [],
  iconColor = 'text-pink-500',
  iconBg = 'bg-pink-500/10 border-pink-500/30',
  gradient = '',
}) {
  return (
    <div
      className={`border-b border-white/[0.07] px-[22px] pb-4 pt-[18px] flex-shrink-0 ${gradient}`}
      style={{ background: gradient || '#17171B' }}
    >
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className='mb-2.5 flex items-center gap-1.5'>
          {breadcrumb.map((crumb, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <div
                key={index}
                className='flex items-center gap-1.5'
              >
                {index > 0 && (
                  <i className='ti ti-chevron-right text-[11px] text-neutral-700' />
                )}
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className='text-[11.5px] text-neutral-600 transition-colors hover:text-pink-500'
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`text-[11.5px] ${isLast ? 'text-neutral-400' : 'text-neutral-600'}`}
                  >
                    {crumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fila título + buscador */}
      <div className='flex items-center gap-3'>
        {/* Ícono */}
        <div
          className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] border ${iconBg}`}
        >
          <i className={`ti ${icon} text-[20px] ${iconColor}`} />
        </div>

        {/* Título y subtítulo */}
        <div className='flex-1 min-w-0'>
          <h1 className='text-[20px] font-bold leading-tight tracking-[-0.4px] text-neutral-100'>
            {title}
          </h1>
          <p className='mt-1  text-[12px] text-neutral-600'>{subtitle}</p>
        </div>

        {/* Buscador */}
        <div className='ml-auto flex h-[34px] min-w-[220px] items-center gap-1.5 rounded-[10px] border border-white/[0.07] bg-white/[0.06] px-[11px] transition-colors focus-within:border-blue-400/35 hover:border-white/[0.14]'>
          <i className='ti ti-search text-[13px] text-neutral-600 flex-shrink-0' />
          <input
            type='text'
            placeholder={searchPlaceholder}
            autoComplete='off'
            className='flex-1 bg-transparent text-[12.5px] text-neutral-100 placeholder-neutral-600 outline-none'
          />
        </div>
      </div>
    </div>
  );
}
