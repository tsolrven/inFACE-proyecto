import GaleriaImagenes from '@/shared/post/images/GaleriaImagenes';
import AudioAutenticado from '@/features/creative-space/components/AudioAutenticado';
import { parsearEnlace } from '@/features/creative-space/utils/embed';

export function EmbedEnlace({ enlace, autoplay = false }) {
  const embed = parsearEnlace(enlace);
  if (!embed) {
    return (
      <a
        href={enlace}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3 py-2.5 text-[12.5px] text-blue-400 hover:underline'
      >
        <i className='ti ti-external-link' /> Abrir enlace
      </a>
    );
  }
  return (
    <div
      className={`w-full overflow-hidden rounded-[10px] border border-white/[0.07] bg-black ${embed.alto}`}
    >
      <iframe
        src={
          autoplay
            ? `${embed.src}${embed.src.includes('?') ? '&' : '?'}${embed.plataforma === 'SoundCloud'
              ? 'auto_play=true'
              : 'autoplay=1'
            }`
            : embed.src
        }
        title={`Reproductor de ${embed.plataforma}`}
        loading='lazy'
        allow='autoplay; encrypted-media; picture-in-picture; fullscreen'
        allowFullScreen
        referrerPolicy='strict-origin-when-cross-origin'
        className='h-full w-full border-0'
      />
    </div>
  );
}

export default function MediaObra({ obra, llenar = false }) {
  const archivos = obra.archivos ?? [];
  const imagenes = archivos.filter((a) => a.tipo_mime?.startsWith('image/'));
  const audios = archivos.filter((a) => a.tipo_mime?.startsWith('audio/'));

  return (
    <div className={`flex flex-col gap-3 ${llenar ? 'h-full' : ''}`}>
      {obra.enlace_url && <EmbedEnlace enlace={obra.enlace_url} />}
      {audios.map((a) => (
        <AudioAutenticado
          key={a.id}
          archivo={a}
          className={llenar ? 'flex flex-1 flex-col justify-center' : ''}
        />
      ))}
      {imagenes.length > 0 && <GaleriaImagenes archivos={imagenes} />}
    </div>
  );
}