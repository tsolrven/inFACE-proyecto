// Pestañas de página (Publicaciones / Guardados, Materiales / Foro…).
//   pestanas: [{ id, label, icono }]
//   acento:   clase completa de borde del color del módulo (ej: 'border-emerald-400'),
//             escrita completa para que Tailwind la detecte.
export default function Pestanas({
  pestanas,
  activa,
  onCambiar,
  acento = 'border-pink-500',
  rightContent,
}) {
  return (
    <div className='flex items-center gap-3 border-b border-white/[0.06] px-4 pt-2'>
      <div
        className={`flex gap-1 ${
          rightContent
            ? 'scrollbar-oculta min-w-0 flex-1 overflow-x-auto'
            : ''
        }`}
      >
        {pestanas.map((p) => (
          <button
            key={p.id}
            type='button'
            onClick={() => onCambiar(p.id)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors ${
              activa === p.id
                ? `${acento} text-neutral-100`
                : 'border-transparent text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <i className={`ti ${p.icono} text-[15px]`} /> {p.label}
          </button>
        ))}
      </div>
      {rightContent && (
        <div className='flex shrink-0 items-center'>{rightContent}</div>
      )}
    </div>
  );
}
