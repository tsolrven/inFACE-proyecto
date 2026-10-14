function FlechaVoto({ direccion, activo, className }) {
  const d =
    direccion === 'up'
      ? 'M9 20v-8h-3.586a1 1 0 0 1 -.707 -1.707l6.586 -6.586a1 1 0 0 1 1.414 0l6.586 6.586a1 1 0 0 1 -.707 1.707h-3.586v8a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z'
      : 'M9 4v8h-3.586a1 1 0 0 0 -.707 1.707l6.586 6.586a1 1 0 0 0 1.414 0l6.586 -6.586a1 1 0 0 0 -.707 -1.707h-3.586v-8a1 1 0 0 0 -1 -1h-4a1 1 0 0 0 -1 1z';

  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      fill={activo ? 'currentColor' : 'none'}
      stroke='currentColor'
      strokeWidth={activo ? '0' : '2'}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d={d} />
    </svg>
  );
}

export default function VotePill({ miVoto, votosNeto, onVotar }) {
  const colorClase =
    miVoto === 'up'
      ? 'bg-[#FF6B35] text-white'
      : miVoto === 'down'
        ? 'bg-[#7B8CDE] text-white'
        : 'bg-white/[0.06] text-neutral-400';

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${colorClase}`}
    >
      <button
        type='button'
        onClick={(e) => onVotar(e, 'up')}
        className='flex h-[20px] w-[20px] items-center justify-center transition-colors hover:text-[#FFB340]'
      >
        <FlechaVoto
          direccion='up'
          activo={miVoto === 'up'}
          className='h-4 w-4'
        />
      </button>
      <span className='min-w-[10px] text-center text-xs font-bold leading-none'>
        {votosNeto}
      </span>
      <button
        type='button'
        onClick={(e) => onVotar(e, 'down')}
        className='flex h-[20px] w-[20px] items-center justify-center transition-colors hover:text-[#5EC8F2]'
      >
        <FlechaVoto
          direccion='down'
          activo={miVoto === 'down'}
          className='h-4 w-4'
        />
      </button>
    </div>
  );
}
