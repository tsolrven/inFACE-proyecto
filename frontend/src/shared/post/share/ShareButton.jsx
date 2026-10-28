import { mostrarToast } from '@/shared/stores/toastStore';

export default function ShareButton({ path, titulo }) {
  async function handleShare(e) {
    e.stopPropagation();
    const url = `${window.location.origin}${path}`;
    try {
      const esTactil = window.matchMedia('(pointer: coarse)').matches;
      if (navigator.share && esTactil) {
        await navigator.share({ title: titulo, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      mostrarToast('Enlace copiado');
    } catch (err) {
      if (err.name !== 'AbortError')
        mostrarToast('No se pudo copiar el enlace');
    }
  }

  return (
    <button
      type='button'
      onClick={handleShare}
      className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
    >
      <i className='ti ti-share-3 text-[13px]' /> Compartir
    </button>
  );
}
