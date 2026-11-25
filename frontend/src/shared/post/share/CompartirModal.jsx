import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import { mostrarToast } from '@/shared/stores/toastStore';

/**
 * Modal genérico para compartir un contenido de InFACE.
 * - path: ruta interna (/foro-por-ramos/:id); la URL completa se arma aquí
 * - titulo / texto: título del contenido y texto que acompaña al enlace
 * - vistaPrevia: { icono, color, etiqueta, subtitulo, miniatura? }
 *   miniatura (opcional) es un nodo que reemplaza al ícono, p. ej. una imagen
 */
export default function CompartirModal({
  open,
  onClose,
  path,
  titulo,
  texto,
  vistaPrevia = {},
}) {
  const url = `${window.location.origin}${path}`;
  const mensaje = texto ?? `${titulo} — en InFACE`;
  const { icono = 'ti-link', color = '#a3a3a3', etiqueta, subtitulo, miniatura } =
    vistaPrevia;

  async function copiar(textoACopiar, aviso) {
    try {
      await navigator.clipboard.writeText(textoACopiar);
      mostrarToast(aviso);
    } catch {
      mostrarToast('No se pudo copiar el enlace');
    }
  }

  const enc = encodeURIComponent;
  // [nombre, ícono, href, alHacerClic?]
  const redes = [
    ['WhatsApp', 'ti-brand-whatsapp', `https://wa.me/?text=${enc(`${mensaje} ${url}`)}`],
    // Discord no tiene enlace para compartir desde la web: se copia el
    // mensaje y se abre Discord para pegarlo (el <a> abre la pestaña)
    [
      'Discord',
      'ti-brand-discord',
      'https://discord.com/app',
      () =>
        copiar(
          `${mensaje} ${url}`,
          'Enlace copiado: pégalo en Discord con Ctrl+V',
        ),
    ],
    [
      'Telegram',
      'ti-brand-telegram',
      `https://t.me/share/url?url=${enc(url)}&text=${enc(mensaje)}`,
    ],
    [
      'X',
      'ti-brand-x',
      `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(mensaje)}`,
    ],
    // Facebook ya no acepta texto prellenado: solo el enlace
    [
      'Facebook',
      'ti-brand-facebook',
      `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    ],
  ];

  return (
    // El Modal va en un portal, pero los eventos de React igual suben al
    // padre: sin esto, un clic en el modal abriría la tarjeta de debajo
    <div onClick={(e) => e.stopPropagation()}>
      <Modal
        open={open}
        onClose={onClose}
        maxWidth='460px'
      >
        <ModalHeader
          title='Compartir'
          onClose={onClose}
        />
        <div className='flex flex-col gap-4 p-5'>
          <div className='flex overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#17171B]'>
            {miniatura ?? (
              <div
                className='flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center text-3xl'
                style={{ background: `${color}22`, color }}
              >
                <i className={`ti ${icono}`} />
              </div>
            )}
            <div className='min-w-0 flex-1 p-3'>
              <div className='mb-0.5 text-[10.5px] font-bold uppercase tracking-wide text-neutral-500'>
                InFACE{etiqueta ? ` · ${etiqueta}` : ''}
              </div>
              <div className='line-clamp-2 break-words text-[14px] font-semibold text-neutral-100'>
                {titulo}
              </div>
              {subtitulo && (
                <div className='mt-0.5 truncate text-[12px] text-neutral-500'>
                  {subtitulo}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 rounded-[10px] border border-white/[0.09] bg-[#17171B] p-1.5 pl-3'>
            <span className='min-w-0 flex-1 truncate text-[12px] text-neutral-400'>
              {url}
            </span>
            <button
              type='button'
              onClick={() => copiar(url, 'Enlace copiado')}
              className='flex-shrink-0 rounded-lg bg-white/[0.09] px-3 py-1.5 text-[12px] font-semibold text-neutral-100 hover:bg-white/[0.15]'
            >
              Copiar
            </button>
          </div>

          <div className='grid grid-cols-5 gap-2'>
            {redes.map(([nombre, icono, href, alHacerClic]) => (
              <a
                key={nombre}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                onClick={alHacerClic}
                className='flex flex-col items-center gap-1 rounded-[10px] bg-white/[0.04] py-2.5 text-[11px] text-neutral-300 transition-colors hover:bg-white/[0.09]'
              >
                <i className={`ti ${icono} text-xl`} />
                {nombre}
              </a>
            ))}
          </div>

          <p className='flex items-center gap-1.5 text-[11.5px] text-neutral-500'>
            <i className='ti ti-lock text-[13px]' />
            Solo podrán verlo quienes tengan cuenta en InFACE.
          </p>
        </div>
      </Modal>
    </div>
  );
}