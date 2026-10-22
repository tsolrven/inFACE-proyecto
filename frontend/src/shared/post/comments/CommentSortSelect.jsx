import { COMENTARIO_ORDENES } from '@/shared/post/comments/constants';

export default function CommentSortSelect({ value, onChange }) {
  return (
    <div
      role='group'
      aria-label='Ordenar comentarios'
      className='flex items-center gap-1'
    >
      <span className='mr-1 text-[11.5px] text-neutral-600'>Ordenar por:</span>
      {COMENTARIO_ORDENES.map((orden) => (
        <button
          key={orden.valor}
          type='button'
          onClick={() => onChange(orden.valor)}
          aria-pressed={value === orden.valor}
          className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
            value === orden.valor
              ? 'bg-white/[0.1] text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-200'
          }`}
        >
          {orden.label}
        </button>
      ))}
    </div>
  );
}
