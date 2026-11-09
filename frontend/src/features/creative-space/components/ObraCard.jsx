import IconoPlay from '@/features/creative-space/components/IconoPlay';
import { Link, useNavigate } from 'react-router-dom';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useVotar } from '@/shared/post/votes/useVotar';
import VotePill from '@/shared/post/votes/VotePill';
import CompartirObra from '@/features/creative-space/components/CompartirObra';
import GuardarObraButton from '@/features/creative-space/components/GuardarObraButton';
import InsigniaBorrador from '@/features/creative-space/components/InsigniaBorrador';
import PortadaImagen from '@/shared/post/images/PortadaImagen';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import PoemaTile from '@/features/creative-space/components/PoemaTile';
import QuitarGuardadoButton from '@/shared/post/bookmarks/QuitarGuardadoButton';
import { extractoPlano } from '@/shared/markdown/extractoPlano';
import ObraMenu from '@/features/creative-space/components/ObraMenu';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import { parsearEnlace } from '@/features/creative-space/utils/embed';
import { rutas } from '@/features/creative-space/utils/espacios';

function Resumen({ obra }) {
  const audios = (obra.archivos ?? []).filter((a) =>
    a.tipo_mime?.startsWith('audio/'),
  );
  const plataforma = obra.enlace_url
    ? (parsearEnlace(obra.enlace_url)?.plataforma ?? 'Enlace externo')
    : null;

  const piezas = [];
  if (audios.length > 0) {
    piezas.push([
      'ti-music',
      `${audios.length} audio${audios.length > 1 ? 's' : ''}`,
    ]);
  }
  if (plataforma) piezas.push(['ti-player-play', plataforma]);
  if (obra.tipo === 'album') {
    piezas.push(['ti-disc', `${obra.pistas_count} pistas`]);
  }
  if (obra.tipo === 'guion') {
    piezas.push(['ti-list-details', `${obra.capitulos_count} capítulos`]);
    if (obra.personajes_count > 0) {
      piezas.push(['ti-users', `${obra.personajes_count} personajes`]);
    }
  }
  if (piezas.length === 0) return null;

  return (
    <div className='mb-2 flex flex-wrap gap-1.5'>
      {piezas.map(([icono, texto]) => (
        <span
          key={texto}
          className='flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-neutral-300'
        >
          <i className={`ti ${icono} text-[12px]`} /> {texto}
        </span>
      ))}
    </div>
  );
}

export default function ObraCard({ obra, enGuardados = false }) {
  const navigate = useNavigate();
  const votarMut = useVotar('obra');
  const miniatura = obra.enlace_url
    ? (parsearEnlace(obra.enlace_url)?.miniatura ?? null)
    : null;
  const tipo = TIPO_POR_ID[obra.tipo];

  const extracto = extractoPlano(
    obra.tipo === 'poema' ? '' : (obra.descripcion ?? ''),
    obra.descripcion_truncada,
  );

  function abrirDetalle() {
    navigate(rutas.obra(obra.id));
  }

  function handleVotar(e, v) {
    e.stopPropagation();
    votarMut.mutate({ id: obra.id, tipo: v });
  }

  return (
    <div
      onClick={abrirDetalle}
      className='relative mb-2 flex cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.12]'
    >
      {enGuardados ? (
        <QuitarGuardadoButton
          tipo='obra'
          id={obra.id}
          className='absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/[0.08]'
        />
      ) : (
        <ObraMenu
          obra={obra}
          className='absolute right-2 top-2 z-10'
          triggerClassName='flex h-7 w-7 items-center justify-center rounded-full text-base text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-200'
        />
      )}

      {(obra.tipo === 'musica' || obra.tipo === 'album') && (
        <ImagenObra
          archivoId={obra.portada_id}
          fallbackSrc={miniatura}
          icono={obra.tipo === 'album' ? 'ti-disc' : 'ti-music'}
          alt={`Portada de ${obra.titulo}`}
          className='m-3 mr-0 aspect-square w-[96px] flex-shrink-0 self-start rounded-[8px] border border-white/[0.07] bg-[#17171B] sm:w-[116px]'
        />
      )}
      {(obra.tipo === 'historia' || obra.tipo === 'guion') && (
        <ImagenObra
          archivoId={obra.portada_id}
          icono='ti-book-2'
          alt={`Portada de ${obra.titulo}`}
          className='m-3 mr-0 aspect-[2/3] w-[84px] flex-shrink-0 self-start rounded-[8px] border border-white/[0.07] bg-[#17171B]'
        />
      )}
      <div className='min-w-0 flex-1 p-3'>
        <div className='mb-1.5 flex flex-wrap items-center gap-1.5 pr-8'>
          {tipo && (
            <span
              className='flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
              style={{ background: `${tipo.color}22`, color: tipo.color }}
            >
              <i className={`ti ${tipo.icono} text-[11px]`} /> {tipo.label}
            </span>
          )}
          {obra.borrador && <InsigniaBorrador />}
          <span className='text-[11.5px] text-neutral-600'>
            por{' '}
            <Link
              to={`/perfil/usuario/${obra.autor?.nombre_usuario}`}
              onClick={(e) => e.stopPropagation()}
              className='font-bold text-neutral-400 transition hover:text-neutral-100 hover:underline'
            >
              u/{obra.autor?.nombre_usuario}
            </Link>
          </span>
          <span className='text-[11px] text-neutral-600'>
            · {formatearTiempoRelativo(obra.creado_en)}
          </span>
          {obra.editado_en && (
            <span className='text-[11px] text-neutral-700'>
              · editado {formatearTiempoRelativo(obra.editado_en)}
            </span>
          )}
        </div>

        <div className='mb-1 break-words text-sm font-semibold leading-snug text-neutral-100 hover:text-blue-400'>
          {obra.titulo}
        </div>

        {extracto && (
          <p className='mb-1.5 line-clamp-3 break-words text-xs leading-relaxed text-neutral-400'>
            {extracto}
          </p>
        )}

        <Resumen obra={obra} />
        {obra.tipo === 'poema' && (
          <div className='mb-2'>
            <PoemaTile
              obra={obra}
              className={
                obra.portada_id
                  ? 'aspect-video max-h-[260px]'
                  : 'aspect-[4/3] max-h-[320px]'
              }
            />
          </div>
        )}
        {obra.tipo === 'audiovisual' && miniatura && (
          <div className='relative mb-2 aspect-video max-h-[300px] w-full overflow-hidden rounded-[10px] border border-white/[0.07] bg-black'>
            <img
              src={miniatura}
              alt={`Miniatura de ${obra.titulo}`}
              loading='lazy'
              className='h-full w-full object-cover'
            />
            <span className='absolute inset-0 flex items-center justify-center'>
              <span className='flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-2xl text-white'>
                <IconoPlay />
              </span>
            </span>
          </div>
        )}
        {obra.tipo !== 'poema' && <PortadaImagen archivos={obra.archivos} />}

        {obra.hashtags?.length > 0 && (
          <div className='mb-1.5 flex flex-wrap gap-1.5'>
            {obra.hashtags.map((tag) => (
              <Link
                key={tag}
                to={rutas.hashtag(tag)}
                onClick={(e) => e.stopPropagation()}
                className='text-[11px] text-blue-400 hover:underline'
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-2 text-[11.5px] text-neutral-500'>
          <VotePill
            miVoto={obra.mi_voto}
            votosNeto={obra.votos_neto}
            onVotar={handleVotar}
          />
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              abrirDetalle();
            }}
            className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
          >
            <i className='ti ti-message-circle-2 text-[13px]' />{' '}
            {obra.comentarios_count}
          </button>
          <GuardarObraButton obra={obra} />
          <CompartirObra obra={obra} />
        </div>
      </div>
    </div>
  );
}
