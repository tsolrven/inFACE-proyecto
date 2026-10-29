import { Link, useNavigate, useLocation } from 'react-router-dom';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useVotar } from '@/shared/post/votes/useVotar';
import VotePill from '@/shared/post/votes/VotePill';
import ShareButton from '@/shared/post/share/ShareButton';
import PortadaImagen from '@/shared/post/images/PortadaImagen';
import HiloMenu from '@/features/forum/components/HiloMenu';
import { extractoPlano } from '@/features/forum/utils/extractoPlano';
import { rutaHashtag } from '@/shared/lib/hashtags';

export default function HiloCard({ hilo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const votarMut = useVotar('hilo');

  const ramoColor = colorPorRamo(hilo.ramo?.id);
  const extracto = extractoPlano(hilo.contenido ?? '', hilo.contenido_truncado);

  // El detalle (F2) se abre como modal sobre la lista, igual que en materiales.
  function abrirDetalle() {
    navigate(`/foro-por-ramos/${hilo.id}`, {
      state: { backgroundLocation: location },
    });
  }

  function handleVotar(e, tipo) {
    e.stopPropagation();
    votarMut.mutate({ id: hilo.id, tipo });
  }

  return (
    <div
      onClick={abrirDetalle}
      className='relative mb-2 flex cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.12]'
    >
      <HiloMenu
        hilo={hilo}
        className='absolute right-2 top-2 z-10'
        triggerClassName='flex h-7 w-7 items-center justify-center rounded-full text-base text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-200'
      />

      <div className='min-w-0 flex-1 p-3'>
        <div className='mb-1.5 flex flex-wrap items-center gap-1.5 pr-8'>
          <span
            className='rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
            style={{ background: `${ramoColor}22`, color: ramoColor }}
          >
            {hilo.ramo?.nombre}
          </span>
          {hilo.resuelto && (
            <span className='flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400'>
              <i className='ti ti-circle-check text-[11px]' /> Resuelto
            </span>
          )}
          <span className='text-[11.5px] text-neutral-600'>
            por{' '}
            <Link
              to={`/perfil/usuario/${hilo.autor?.nombre_usuario}`}
              onClick={(e) => e.stopPropagation()}
              className='font-bold text-neutral-400 transition hover:text-neutral-100 hover:underline'
            >
              u/{hilo.autor?.nombre_usuario}
            </Link>
          </span>
          <span className='text-[11px] text-neutral-600'>
            · {formatearTiempoRelativo(hilo.creado_en)}
          </span>
          {hilo.editado_en && (
            <span className='text-[11px] text-neutral-700'>
              · editado {formatearTiempoRelativo(hilo.editado_en)}
            </span>
          )}
        </div>

        <div className='mb-1 text-sm font-semibold leading-snug text-neutral-100 hover:text-blue-400'>
          {hilo.titulo}
        </div>

        {extracto && (
          <p className='mb-1.5 line-clamp-3 break-words text-xs leading-relaxed text-neutral-400'>
            {extracto}
          </p>
        )}

        <PortadaImagen archivos={hilo.archivos} />

        {hilo.hashtags?.length > 0 && (
          <div className='mb-1.5 flex flex-wrap gap-1.5'>
            {hilo.hashtags.map((tag) => (
              <Link
                key={tag}
                to={rutaHashtag(tag, 'foro')}
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
            miVoto={hilo.mi_voto}
            votosNeto={hilo.votos_neto}
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
            {hilo.comentarios_count}
          </button>

          <ShareButton
            path={`/foro-por-ramos/${hilo.id}`}
            titulo={hilo.titulo}
          />
        </div>
      </div>
    </div>
  );
}
