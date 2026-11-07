import { useComentariosParrafos } from '@/features/creative-space/hooks/useObras';
import MarkdownView from '@/shared/markdown/MarkdownView';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';

export default function ComentariosParrafos({ obra }) {
  const { data = [] } = useComentariosParrafos(
    obra.id,
    obra.tipo === 'historia',
  );
  if (obra.tipo !== 'historia' || data.length === 0) return null;

  return (
    <div className='mb-6'>
      <h3 className='mb-3 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-neutral-500'>
        <i className='ti ti-quote' /> Comentarios en párrafos ({data.length})
      </h3>
      <div className='flex flex-col gap-2.5'>
        {data.map((c) => (
          <div
            key={c.id}
            className='rounded-[10px] border border-white/[0.06] bg-[#17171B] p-3'
          >
            <p className='mb-2 line-clamp-2 border-l-2 border-sky-400/50 pl-2.5 text-[12px] italic leading-relaxed text-neutral-500'>
              «{c.extracto}»
              <span className='ml-1.5 not-italic text-neutral-600'>
                — Cap. {c.capitulo_orden + 1}, {c.capitulo_titulo}
              </span>
            </p>
            <div className='text-[13px] leading-relaxed text-neutral-200'>
              <MarkdownView contenido={c.contenido} />
            </div>
            <div className='mt-1.5 text-[11.5px] text-neutral-600'>
              <b className='text-neutral-400'>u/{c.autor.nombre_usuario}</b> ·{' '}
              {formatearTiempoRelativo(c.creado_en)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
