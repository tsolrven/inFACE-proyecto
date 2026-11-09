import { useState } from 'react';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import { parsearEnlace } from '@/features/creative-space/utils/embed';
import { rutas } from '@/features/creative-space/utils/espacios';
import { mostrarToast } from '@/shared/stores/toastStore';

export default function CompartirObra({ obra }) {
  const [abierto, setAbierto] = useState(false);
  const tipo = TIPO_POR_ID[obra.tipo];
  const url = `${window.location.origin}${rutas.obra(obra.id)}`;
  const texto = `${obra.titulo} — por u/${obra.autor?.nombre_usuario}`;

  const miniatura = obra.enlace_url
    ? (parsearEnlace(obra.enlace_url)?.miniatura ?? null)
    : null;
  const primeraImagen = (obra.archivos ?? []).find((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const imagenId = obra.portada_id ?? primeraImagen?.id ?? null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      mostrarToast('Enlace copiado');
    } catch {
      mostrarToast('No se pudo copiar el enlace');
    }
  }

  async function abrirCompartir(e) {
    e.stopPropagation();
    const esTactil = window.matchMedia?.('(pointer: coarse)').matches;
    if (navigator.share && esTactil) {
      try {
        await navigator.share({ title: obra.titulo, text: texto, url });
      } catch (err) {
        if (err.name !== 'AbortError') setAbierto(true);
      }
      return;
    }
    setAbierto(true);
  }

  const redes = [
    [
      'WhatsApp',
      'ti-brand-whatsapp',
      `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`,
    ],
    [
      'Telegram',
      'ti-brand-telegram',
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`,
    ],
    [
      'X',
      'ti-brand-x',
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`,
    ],
    [
      'Facebook',
      'ti-brand-facebook',
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    ],
  ];

  return (
    <>
      <button
        type='button'
        onClick={abrirCompartir}
        className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
      >
        <i className='ti ti-share-3 text-[13px]' /> Compartir
      </button>

      <div onClick={(e) => e.stopPropagation()}>
        <Modal
          open={abierto}
          onClose={() => setAbierto(false)}
          maxWidth='460px'
        >
          <ModalHeader
            title='Compartir'
            onClose={() => setAbierto(false)}
          />
          <div className='flex flex-col gap-4 p-5'>
            <div className='flex overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#17171B]'>
              {imagenId ? (
                <ImagenObra
                  archivoId={imagenId}
                  className='h-[96px] w-[96px] flex-shrink-0'
                />
              ) : miniatura ? (
                <img
                  src={miniatura}
                  alt=''
                  className='h-[96px] w-[128px] flex-shrink-0 object-cover'
                />
              ) : (
                <div
                  className='flex h-[96px] w-[96px] flex-shrink-0 items-center justify-center text-3xl'
                  style={{
                    background: `${tipo?.color ?? '#888'}22`,
                    color: tipo?.color,
                  }}
                >
                  <i className={`ti ${tipo?.icono ?? 'ti-palette'}`} />
                </div>
              )}
              <div className='min-w-0 flex-1 p-3'>
                <div className='mb-0.5 text-[10.5px] font-bold uppercase tracking-wide text-neutral-500'>
                  inFACE · Espacio creativo
                </div>
                <div className='line-clamp-2 break-words text-[14px] font-semibold text-neutral-100'>
                  {obra.titulo}
                </div>
                <div className='mt-0.5 text-[12px] text-neutral-500'>
                  {tipo?.label} · u/{obra.autor?.nombre_usuario}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 rounded-[10px] border border-white/[0.09] bg-[#17171B] p-1.5 pl-3'>
              <span className='min-w-0 flex-1 truncate text-[12px] text-neutral-400'>
                {url}
              </span>
              <button
                type='button'
                onClick={copiar}
                className='flex-shrink-0 rounded-lg bg-white/[0.09] px-3 py-1.5 text-[12px] font-semibold text-neutral-100 hover:bg-white/[0.15]'
              >
                Copiar
              </button>
            </div>

            <div className='grid grid-cols-4 gap-2'>
              {redes.map(([nombre, icono, href]) => (
                <a
                  key={nombre}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex flex-col items-center gap-1 rounded-[10px] bg-white/[0.04] py-2.5 text-[11px] text-neutral-300 transition-colors hover:bg-white/[0.09]'
                >
                  <i className={`ti ${icono} text-xl`} />
                  {nombre}
                </a>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
