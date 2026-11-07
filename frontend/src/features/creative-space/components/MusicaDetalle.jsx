import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import AlbumPistas from '@/features/creative-space/components/AlbumPistas';
import InsigniaBorrador from '@/features/creative-space/components/InsigniaBorrador';
import { parsearEnlace } from '@/features/creative-space/utils/embed';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';

export default function MusicaDetalle({ obra, cargando = false }) {
  const esAlbum = obra.tipo === 'album';
  const [abierta, setAbierta] = useState(null);
  const pistas = obra.pistas ?? [];
  const miniatura = obra.enlace_url
    ? (parsearEnlace(obra.enlace_url)?.miniatura ?? null)
    : null;
  const nombre = obra.autor?.nombre_usuario;

  return (
    <div className='mb-4'>
      <div
        className='-mx-4 -mt-5 mb-5 px-4 pb-6 pt-8 sm:-mx-6 sm:px-6'
        style={{
          background:
            'linear-gradient(180deg, rgba(236,72,153,0.38) 0%, rgba(124,58,237,0.16) 55%, rgba(26,26,31,0) 100%)',
        }}
      >
        <div className='flex flex-col items-center gap-5 sm:flex-row sm:items-end'>
          <ImagenObra
            archivoId={obra.portada_id}
            fallbackSrc={miniatura}
            icono={esAlbum ? 'ti-disc' : 'ti-music'}
            alt={`Portada de ${obra.titulo}`}
            className='aspect-square w-[180px] flex-shrink-0 rounded-[6px] bg-[#282830] shadow-[0_12px_40px_rgba(0,0,0,0.55)] sm:w-[232px]'
          />
          <div className='min-w-0 flex-1 text-center sm:text-left'>
            <div className='mb-1 flex items-center justify-center gap-2 sm:justify-start'>
              <span className='text-[12px] font-bold'>
                {esAlbum ? 'Álbum' : 'Canción'}
              </span>
              {obra.borrador && <InsigniaBorrador />}
            </div>
            <h2 className='mb-3 break-words text-[30px] font-extrabold leading-[1.05] tracking-tight text-neutral-50 sm:text-[46px]'>
              {obra.titulo}
            </h2>
            <div className='flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[13px] text-neutral-300 sm:justify-start'>
              <Link
                to={`/perfil/usuario/${nombre}`}
                className='flex items-center gap-1.5 font-bold text-neutral-100 hover:underline'
              >
                <span className='flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-[9px] font-bold text-pink-300'>
                  {nombre?.slice(0, 2).toUpperCase()}
                </span>
                u/{nombre}
              </Link>
              <span className='text-neutral-500'>•</span>
              <span>{formatearTiempoRelativo(obra.creado_en)}</span>
              {esAlbum && (
                <>
                  <span className='text-neutral-500'>•</span>
                  <span>
                    {obra.pistas_count}{' '}
                    {obra.pistas_count === 1 ? 'canción' : 'canciones'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {esAlbum &&
        (cargando ? (
          <p className='flex items-center gap-2 text-[12px] text-neutral-600'>
            <i className='ti ti-loader-2 animate-spin' /> Cargando canciones...
          </p>
        ) : (
          <AlbumPistas
            pistas={pistas}
            abierta={abierta}
            onAbrir={setAbierta}
          />
        ))}
    </div>
  );
}
