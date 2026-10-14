//! tarjeta genérica del panel derecho. Recibe un título, un ícono de Tabler y cualquier contenido como children.

export default function RpCard({
  title,
  icon,
  iconColor = 'text-pink-500',
  children,
}) {
  return (
    <div className='rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3'>
      <div className='mb-2.5 flex items-center gap-1.5'>
        <i className={`ti ${icon} text-sm ${iconColor}`} />
        <span className='text-[11.5px] font-bold uppercase tracking-[0.6px] text-neutral-400'>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
