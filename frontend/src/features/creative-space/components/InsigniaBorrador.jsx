export default function InsigniaBorrador({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 ${className}`}
    >
      <i className='ti ti-lock text-[11px]' /> Borrador
    </span>
  );
}
