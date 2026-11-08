import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MarkdownView from '@/shared/markdown/MarkdownView';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import {
  obtenerParrafos,
  resolverParrafo,
} from '@/features/creative-space/api/creative.api';
import { separarParrafos } from '@/features/creative-space/utils/parrafos';
import { mostrarToast } from '@/shared/stores/toastStore';

const TAMANOS = [14, 15, 16, 17, 19, 21, 24];

export default function HistoriaReader({ obra }) {
  const qc = useQueryClient();
  const capitulos = obra.capitulos ?? [];
  const [indice, setIndice] = useState(0);
  const [tamano, setTamano] = useState(() => {
    try {
      const guardado = Number(localStorage.getItem('inface-lector-tamano'));
      return TAMANOS.includes(guardado) ? guardado : 17;
    } catch {
      return 17;
    }
  });
  function cambiarTamano(delta) {
    const i = Math.min(
      TAMANOS.length - 1,
      Math.max(0, TAMANOS.indexOf(tamano) + delta),
    );
    setTamano(TAMANOS[i]);
    try {
      localStorage.setItem('inface-lector-tamano', String(TAMANOS[i]));
    } catch {
    }
  }
  const [abierto, setAbierto] = useState(null); // { indice, id }
  const actual = capitulos[indice];
  const claveParrafos = ['obra', 'parrafos', actual?.id];

  const { data: conteos = {} } = useQuery({
    queryKey: claveParrafos,
    queryFn: ({ signal }) => obtenerParrafos(actual.id, { signal }),
    enabled: !!actual,
  });

  const abrir = useMutation({
    mutationFn: (i) => resolverParrafo(actual.id, i),
    onSuccess: ({ id }, i) => setAbierto({ indice: i, id }),
    onError: (err) =>
      mostrarToast(err.message || 'No se pudo abrir los comentarios'),
  });

  function irA(i) {
    setIndice(i);
    setAbierto(null);
    window.scrollTo?.({ top: 0 });
  }

  function alternar(i) {
    if (abierto?.indice === i) {
      setAbierto(null);
      qc.invalidateQueries({ queryKey: claveParrafos });
      return;
    }
    const conocido = conteos[i]?.id;
    if (conocido) setAbierto({ indice: i, id: conocido });
    else abrir.mutate(i);
  }

  const personajes = obra.personajes ?? [];
  if (!actual) {
    return (
      <p className='rounded-[12px] border border-dashed border-white/[0.1] p-6 text-center text-[13px] text-neutral-500'>
        Esta historia aún no tiene capítulos publicados.
      </p>
    );
  }
  const parrafos = separarParrafos(actual.contenido);

  return (
    <div className='flex flex-col gap-4'>
      {personajes.length > 0 && (
        <details className='rounded-[12px] border border-white/[0.07] bg-[#17171B] px-4 py-3'>
          <summary className='flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-neutral-300'>
            <i className='ti ti-users' /> Personajes ({personajes.length})
          </summary>
          <div className='mt-3 grid gap-2.5 sm:grid-cols-2'>
            {personajes.map((p) => (
              <div
                key={p.id}
                className='flex items-start gap-3 rounded-[10px] bg-white/[0.03] p-2.5'
              >
                <ImagenObra
                  archivoId={p.imagen_id}
                  icono='ti-user'
                  className='h-14 w-14 flex-shrink-0 rounded-full border border-white/10 bg-[#1E1E24]'
                />
                <div className='min-w-0'>
                  <div className='text-[13px] font-semibold text-neutral-100'>
                    {p.nombre}
                  </div>
                  {p.descripcion && (
                    <p className='whitespace-pre-line break-words text-[12px] leading-relaxed text-neutral-400'>
                      {p.descripcion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <details className='rounded-[12px] border border-white/[0.07] bg-[#17171B] px-4 py-3'>
        <summary className='flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-neutral-300'>
          <i className='ti ti-list-details' /> Índice ({capitulos.length}{' '}
          {capitulos.length === 1 ? 'capítulo' : 'capítulos'})
        </summary>
        <ol className='mt-2 flex flex-col gap-0.5'>
          {capitulos.map((c, i) => (
            <li key={c.id}>
              <button
                type='button'
                onClick={() => irA(i)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${i === indice
                    ? 'bg-sky-400/10 text-sky-300'
                    : 'text-neutral-400 hover:bg-white/[0.05]'
                  }`}
              >
                {i + 1}. {c.titulo}
                {c.borrador && (
                  <span className='ml-2 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-amber-300'>
                    Borrador
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </details>

      <article className='-mx-1 py-4 sm:mx-0 sm:rounded-[12px] sm:border sm:border-white/[0.07] sm:bg-[#17171B] sm:px-12 sm:py-6 lg:px-20'>
        <div className='mb-4 flex items-start justify-between gap-2'>
          <h3 className='min-w-0 flex-1 break-words text-[19px] font-bold text-neutral-100 sm:text-center'>
            {indice + 1}. {actual.titulo}
          </h3>
          <div className='flex flex-shrink-0 items-center gap-1 rounded-full border border-white/[0.08] px-1 text-neutral-400'>
            <button
              type='button'
              onClick={() => cambiarTamano(-1)}
              disabled={tamano === TAMANOS[0]}
              aria-label='Letra más pequeña'
              className='h-7 w-7 rounded-full text-[12px] font-bold hover:text-neutral-100 disabled:opacity-30'
            >
              A-
            </button>
            <button
              type='button'
              onClick={() => cambiarTamano(1)}
              disabled={tamano === TAMANOS.at(-1)}
              aria-label='Letra más grande'
              className='h-7 w-7 rounded-full text-[15px] font-bold hover:text-neutral-100 disabled:opacity-30'
            >
              A+
            </button>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          {parrafos.map((texto, i) => {
            const total = conteos[i]?.comentarios ?? 0;
            const activo = abierto?.indice === i;
            return (
              <div key={i}>
                <div className='group flex items-start gap-1 sm:gap-2'>
                  <div
                    className='min-w-0 flex-1 text-neutral-200 [&_.md-view]:!text-[length:var(--lector-tam)] [&_.md-view]:!leading-[1.85]'
                    style={{ '--lector-tam': `${tamano}px` }}
                  >
                    <MarkdownView contenido={texto} />
                  </div>
                  <button
                    type='button'
                    onClick={() => alternar(i)}
                    title='Comentar este párrafo'
                    aria-label={`Comentarios del párrafo ${i + 1}`}
                    className={`mt-1 flex h-6 min-w-6 flex-shrink-0 items-center justify-center gap-0.5 rounded-full px-1.5 text-[11px] transition-opacity ${total > 0 || activo
                        ? 'bg-sky-400/15 text-sky-300 opacity-100'
                        : 'text-neutral-600 opacity-40 hover:bg-white/[0.06] hover:opacity-100 group-hover:opacity-80'
                      }`}
                  >
                    {abrir.isPending && abrir.variables === i ? (
                      <i className='ti ti-loader-2 animate-spin' />
                    ) : (
                      <>
                        <i className='ti ti-message-circle-2 text-[13px]' />
                        {total > 0 && total}
                      </>
                    )}
                  </button>
                </div>

                {activo && (
                  <div className='my-2 ml-2 rounded-[10px] border-l-2 border-sky-400/40 bg-black/20 p-3'>
                    <CommentsSection
                      tipoContenido='parrafo'
                      contenidoId={abierto.id}
                      total={total}
                      titulo='Comentarios del párrafo'
                      placeholder='Comenta este párrafo...'
                      textoVacio='Nadie ha comentado este párrafo todavía.'
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className='mt-6 flex justify-between border-t border-white/[0.06] pt-3'>
          <button
            type='button'
            disabled={indice === 0}
            onClick={() => irA(indice - 1)}
            className='flex items-center gap-1 text-[12px] text-neutral-400 hover:text-neutral-100 disabled:opacity-30'
          >
            <i className='ti ti-arrow-left' /> Capítulo anterior
          </button>
          <button
            type='button'
            disabled={indice >= capitulos.length - 1}
            onClick={() => irA(indice + 1)}
            className='flex items-center gap-1 text-[12px] text-neutral-400 hover:text-neutral-100 disabled:opacity-30'
          >
            Capítulo siguiente <i className='ti ti-arrow-right' />
          </button>
        </div>
      </article>
    </div>
  );
}