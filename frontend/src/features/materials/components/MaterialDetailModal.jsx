import { useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import { colorPorRamo } from '@/shared/lib/courseColors';
import {
  metaDeArchivo,
  metaDeBadge,
  metaDeLink,
  formatearTamanio,
  badgesDeApunte,
} from '@/features/materials/utils/fileMeta';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { descargarArchivo } from '@/shared/api/archivos.api';
import { useApunte } from '@/features/materials/hooks/useApuntes';
import { useVotar } from '@/shared/post/votes/useVotar';
import ApunteMenu from '@/features/materials/components/ApunteMenu';
import VotePill from '@/shared/post/votes/VotePill';
import ShareButton from '@/shared/post/share/ShareButton';
import CodeViewer from '@/features/materials/components/CodeViewer';

export default function MaterialDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: apunte, isPending: cargando, error } = useApunte(id);
  const votarMut = useVotar('apunte');
  const comentariosRef = useRef(null);

  function handleClose() {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate('/repositorio-materiales', { replace: true });
  }

  function handleVotar(e, tipo) {
    e?.stopPropagation?.();
    votarMut.mutate({ id, tipo });
  }

  return (
    <Modal
      open
      onClose={handleClose}
      maxWidth='740px'
    >
      {cargando && (
        <div className='flex items-center justify-center py-20'>
          <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
        </div>
      )}

      {error && !cargando && (
        <div className='p-8 text-center text-sm text-red-400'>
          {error.message}
        </div>
      )}

      {apunte && !cargando && (
        <>
          <ModalHeader
            onClose={handleClose}
            rightContent={
              <ApunteMenu
                apunte={apunte}
                triggerClassName='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-base text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
                onEliminado={handleClose}
              />
            }
          >
            <button
              type='button'
              onClick={handleClose}
              title='Volver'
              className='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
            >
              <i className='ti ti-arrow-left text-base' />
            </button>
            <span
              className='rounded-full px-2 py-0.5 text-[10px] font-bold'
              style={{
                background: `${colorPorRamo(apunte.ramo?.id)}22`,
                color: colorPorRamo(apunte.ramo?.id),
              }}
            >
              {apunte.ramo?.nombre}
            </span>
          </ModalHeader>

          <div className='px-6 pb-4 pt-5'>
            <h2 className='mb-3 text-[18px] font-bold leading-snug text-neutral-100'>
              {apunte.titulo}
            </h2>

            <BadgesPrincipales etiquetas={badgesDeApunte(apunte)} />

            <div className='mb-4 flex items-center gap-2 text-[12.5px] text-neutral-600'>
              <Link
                to={`/perfil/usuario/${apunte.autor?.nombre_usuario}`}
                className='flex items-center gap-2 transition hover:opacity-80'
              >
                <div className='flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                  {apunte.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  por{' '}
                  <b className='text-neutral-400 hover:text-neutral-100 hover:underline'>
                    u/{apunte.autor?.nombre_usuario}
                  </b>
                </span>
              </Link>
              <span>·</span>
              <span>{formatearTiempoRelativo(apunte.creado_en)}</span>
              {apunte.editado_en && (
                <span className='text-neutral-700'>
                  · editado {formatearTiempoRelativo(apunte.editado_en)}
                </span>
              )}
            </div>

            {apunte.descripcion && (
              <p className='mb-4 text-[13.5px] leading-relaxed text-neutral-400'>
                {apunte.descripcion}
              </p>
            )}

            <DetalleArchivos apunte={apunte} />

            {apunte.hashtags?.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-1.5'>
                {apunte.hashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() =>
                      navigate(`/repositorio-materiales/tag/${tag}`)
                    }
                    className='cursor-pointer text-[11.5px] text-blue-400 hover:underline'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-[11.5px] text-neutral-500'>
              <VotePill
                miVoto={apunte.mi_voto}
                votosNeto={apunte.votos_neto}
                onVotar={handleVotar}
              />

              <button
                type='button'
                onClick={() =>
                  comentariosRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
              >
                <i className='ti ti-message-circle-2 text-[13px]' />{' '}
                {apunte.comentarios_count ?? 0}
              </button>

              <ShareButton
                path={`/repositorio-materiales/${apunte.id}`}
                titulo={apunte.titulo}
              />

              <span className='ml-auto flex items-center gap-1'>
                <i className='ti ti-download text-[13px]' />{' '}
                {apunte.descargas ?? '—'} descargas
              </span>
            </div>
          </div>

          <div
            ref={comentariosRef}
            className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-6'
          >
            <CommentsSection
              tipoContenido='apunte'
              contenidoId={id}
              total={apunte.comentarios_count ?? 0}
              placeholder='Escribe un comentario o duda sobre este material...'
            />
          </div>
        </>
      )}
    </Modal>
  );
}

function BadgesPrincipales({ etiquetas }) {
  if (!etiquetas?.length) return null;

  return (
    <div className='mb-3 flex flex-wrap gap-1.5'>
      {etiquetas.map((valor) => {
        const meta = metaDeBadge(valor);
        if (!meta) return null;
        return (
          <span
            key={valor}
            className='flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold'
            style={{ background: meta.bg, color: meta.color }}
          >
            <i className={`ti ${meta.icon} text-[13px]`} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function DetalleArchivos({ apunte }) {
  const tieneLinks = apunte.links?.length > 0;
  const tieneSnippet = !!apunte.codigo_snippet;
  const tieneArchivos = apunte.archivos?.length > 0;

  if (!tieneLinks && !tieneSnippet && !tieneArchivos) return null;

  return (
    <div className='mb-4 flex flex-col gap-3'>
      {tieneLinks &&
        apunte.links.map((link, i) => {
          const meta = metaDeLink(link);
          return (
            <a
              key={i}
              href={link}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-2 rounded-md border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.05)] px-3 py-2 text-[12.5px] font-medium text-[#818CF8] hover:underline'
            >
              <i
                className={`ti ${meta.icon} text-base`}
                style={{ color: meta.color }}
              />{' '}
              {link}
            </a>
          );
        })}

      {tieneSnippet && (
        <CodeViewer
          codigo={apunte.codigo_snippet}
          lenguaje={apunte.lenguaje_snippet}
          maxHeight='420px'
        />
      )}

      {tieneArchivos && (
        <div className='flex flex-col gap-2'>
          {apunte.archivos.map((archivo) => {
            const meta = metaDeArchivo(archivo);
            return (
              <div
                key={archivo.id}
                className='flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5'
              >
                <i
                  className={`ti ${meta.icon} flex-shrink-0 text-lg`}
                  style={{ color: meta.color }}
                />
                <span className='flex-1 truncate text-[12.5px] font-medium text-neutral-300'>
                  {archivo.nombre_archivo}
                </span>
                <span className='flex-shrink-0 text-[10.5px] text-neutral-600'>
                  {formatearTamanio(archivo.tamanio)}
                </span>
                <button
                  type='button'
                  onClick={() => descargarArchivo(archivo)}
                  className='flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-400 hover:opacity-75'
                >
                  <i className='ti ti-download' /> Descargar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
