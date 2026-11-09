import IconoPlay from '@/features/creative-space/components/IconoPlay';
import AudioAutenticado from '@/features/creative-space/components/AudioAutenticado';
import { EmbedEnlace } from '@/features/creative-space/components/MediaObra';

export default function AlbumPistas({ pistas = [], abierta, onAbrir }) {
  if (pistas.length === 0) return null;
  const hayReproducible = pistas.some((p) => p.archivo_id || p.enlace_url);
  const primera = pistas.find((p) => p.archivo_id || p.enlace_url);

  return (
    <div>
      {hayReproducible && (
        <button
          type='button'
          onClick={() => onAbrir(abierta ? null : primera.id)}
          aria-label={abierta ? 'Cerrar reproductor' : 'Reproducir álbum'}
          className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-[26px] text-white shadow-lg transition-transform hover:scale-105 hover:bg-pink-400'
        >
          <IconoPlay
            pausa={!!abierta}
            className='text-[24px]'
          />
        </button>
      )}

      <div className='mb-1 flex items-center gap-3 border-b border-white/[0.08] px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500'>
        <span className='w-5 text-center'>#</span>
        <span>Título</span>
      </div>
      <ol>
        {pistas.map((p, i) => {
          const activa = abierta === p.id;
          const reproducible = !!p.archivo_id || !!p.enlace_url;
          return (
            <li key={p.id}>
              <button
                type='button'
                disabled={!reproducible}
                onClick={() => onAbrir(activa ? null : p.id)}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07] disabled:opacity-50 ${
                  activa ? 'bg-white/[0.06]' : ''
                }`}
              >
                <span className='flex w-5 justify-center text-[13px]'>
                  {activa ? (
                    <IconoPlay className='text-pink-400' />
                  ) : (
                    <>
                      <span className='text-neutral-500 group-hover:hidden'>
                        {i + 1}
                      </span>
                      <IconoPlay className='hidden text-neutral-100 group-hover:block' />
                    </>
                  )}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[14.5px] ${
                    activa
                      ? 'font-semibold text-pink-400'
                      : 'font-medium text-neutral-100'
                  }`}
                >
                  {p.titulo}
                </span>
                {!reproducible && (
                  <i className='ti ti-music-off text-neutral-600' />
                )}
              </button>
              {activa && (
                <div className='px-3 pb-3 pt-1'>
                  {p.archivo_id ? (
                    <AudioAutenticado
                      key={p.archivo_id}
                      autoInicio
                      archivo={{ id: p.archivo_id, nombre_archivo: p.titulo }}
                    />
                  ) : (
                    <EmbedEnlace
                      enlace={p.enlace_url}
                      autoplay
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
