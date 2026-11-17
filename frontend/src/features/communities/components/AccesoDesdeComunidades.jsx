import { Link } from 'react-router-dom';
import { navSections } from '@/shared/config/navigation';
import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES } from '@/shared/auth/roles';

const MODULOS = {
  foro: { titulo: 'Foro por ramos', icono: 'ti-message-circle-2' },
  materiales: { titulo: 'Repositorio de materiales', icono: 'ti-books' },
  anuncios: { titulo: 'Anuncios oficiales', icono: 'ti-speakerphone' },
};

const COMUNIDADES =
  navSections.find((s) => s.title === 'Comunidades')?.items ?? [];

// Superadmin y docente no usan las páginas académicas de una carrera: cada
// módulo lo ven desde la comunidad de cada carrera, ya en la pestaña del
// módulo (?pestana= de ComunidadCarrera).
export default function AccesoDesdeComunidades({ modulo }) {
  const { titulo, icono } = MODULOS[modulo];
  const esSuperadmin = useAuthStore(
    (s) => s.usuario?.rol === ROLES.SUPERADMIN,
  );
  const motivo = esSuperadmin
    ? 'Como administrador, accedes a este módulo desde la comunidad de cada carrera.'
    : 'Como docente no perteneces a una carrera: accedes a este módulo desde la comunidad de cada una.';

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center px-4 py-16 text-center'>
      <i className={`ti ${icono} mb-3 text-5xl text-neutral-700`} />
      <h1 className='text-[16px] font-bold text-neutral-100'>{titulo}</h1>
      <p className='mt-1.5 text-[12.5px] leading-relaxed text-neutral-500'>
        {motivo}
      </p>

      <div className='mt-5 flex w-full flex-col gap-1.5'>
        {COMUNIDADES.map((c) => (
          <Link
            key={c.path}
            to={`${c.path}?pestana=${modulo}`}
            className='flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5 text-left text-[13px] text-neutral-300 transition-colors hover:border-white/[0.18] hover:text-neutral-100'
          >
            <i className='ti ti-building text-sm text-neutral-500' />
            <span className='flex-1'>{c.label}</span>
            <i className='ti ti-chevron-right text-xs text-neutral-600' />
          </Link>
        ))}
      </div>
    </div>
  );
}