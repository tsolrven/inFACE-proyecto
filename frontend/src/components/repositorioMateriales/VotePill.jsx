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
        <i
          className={`ti ${miVoto === 'up' ? 'ti-arrow-big-up-filled' : 'ti-arrow-big-up'} text-base`}
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
        <i
          className={`ti ${miVoto === 'down' ? 'ti-arrow-big-down-filled' : 'ti-arrow-big-down'} text-base`}
        />
      </button>
    </div>
  );
}
