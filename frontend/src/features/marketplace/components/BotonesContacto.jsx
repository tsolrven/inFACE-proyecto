import { mostrarToast } from '@/shared/stores/toastStore';
import {
  enlaceInstagram,
  enlaceWhatsapp,
  mostrarWhatsapp,
} from '@/features/marketplace/utils/catalogo';

export default function BotonesContacto({ producto }) {
  async function copiarDiscord() {
    try {
      await navigator.clipboard.writeText(producto.contacto_discord);
      mostrarToast('Usuario de Discord copiado');
    } catch {
      mostrarToast('No se pudo copiar');
    }
  }

  return (
    <div className='flex flex-col gap-1.5'>
      {producto.contacto_whatsapp && (
        <a
          href={enlaceWhatsapp(producto.contacto_whatsapp, producto.titulo)}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[13px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20'
        >
          <i className='ti ti-brand-whatsapp text-[17px]' />
          <span className='flex-1'>
            WhatsApp · {mostrarWhatsapp(producto.contacto_whatsapp)}
          </span>
          <i className='ti ti-external-link text-[13px] opacity-60' />
        </a>
      )}
      {producto.contacto_instagram && (
        <a
          href={enlaceInstagram(producto.contacto_instagram)}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 rounded-lg border border-pink-400/30 bg-pink-400/10 px-3 py-2 text-[13px] font-semibold text-pink-200 transition-colors hover:bg-pink-400/20'
        >
          <i className='ti ti-brand-instagram text-[17px]' />
          <span className='min-w-0 flex-1 truncate'>
            Instagram · @{producto.contacto_instagram}
          </span>
          <i className='ti ti-external-link text-[13px] opacity-60' />
        </a>
      )}
      {producto.contacto_discord && (
        <button
          type='button'
          onClick={copiarDiscord}
          title='Copiar usuario'
          className='flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-400/10 px-3 py-2 text-left text-[13px] font-semibold text-indigo-200 transition-colors hover:bg-indigo-400/20'
        >
          <i className='ti ti-brand-discord text-[17px]' />
          <span className='min-w-0 flex-1 truncate'>
            Discord · {producto.contacto_discord}
          </span>
          <i className='ti ti-copy text-[13px] opacity-60' />
        </button>
      )}
    </div>
  );
}
