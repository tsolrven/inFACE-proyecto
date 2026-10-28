//! contenedor común de las páginas legales (términos, privacidad): título, versión y secciones
import { VERSION_TERMINOS } from '@/shared/legal/terminos';

export function Seccion({ titulo, children }) {
  return (
    <section className='mt-7'>
      <h2 className='text-[15px] font-semibold text-neutral-100'>{titulo}</h2>
      <div className='mt-2 space-y-2 text-[13.5px] leading-relaxed text-neutral-400'>
        {children}
      </div>
    </section>
  );
}

export default function LegalDocument({ titulo, children }) {
  return (
    <article className='mx-auto max-w-3xl px-5 py-10'>
      <h1 className='text-[24px] font-bold text-neutral-50'>{titulo}</h1>
      <p className='mt-1 text-[12px] text-neutral-500'>
        Versión {VERSION_TERMINOS} · Universidad del Bío-Bío, Facultad de
        Ciencias Empresariales
      </p>
      {children}
    </article>
  );
}
