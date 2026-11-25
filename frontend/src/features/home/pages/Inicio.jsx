import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES, esDocenteBase } from '@/shared/auth/roles';
import Hero from '@/features/home/components/Hero';
import {
  ACCESOS_DOCENTE,
  ACCESOS_ESTUDIANTE,
  ACCIONES_DOCENTE,
  ACCIONES_ESTUDIANTE,
} from '@/features/home/utils/accesosInicio';
import PanelAdmin from '@/features/home/sections/PanelAdmin';
import PreviewAnuncios from '@/features/home/sections/PreviewAnuncios';
import PreviewDudas from '@/features/home/sections/PreviewDudas';
import PreviewMateriales from '@/features/home/sections/PreviewMateriales';
import PreviewMatchProyectos from '@/features/home/sections/PreviewMatchProyectos';
import PreviewMarketplace from '@/features/home/sections/PreviewMarketplace';
import PreviewEspacioCreativo from '@/features/home/sections/PreviewEspacioCreativo';

function saludoSegunHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// Solo arma la página según el rol. El superadmin ve la variante de su rol
// base (estudiante o docente) con el panel de administración arriba.
export default function Inicio() {
  const usuario = useAuthStore((s) => s.usuario);
  const nombre =
    (usuario?.nombre_completo || '').split(' ')[0] ||
    usuario?.nombre_usuario ||
    '';
  const docente = esDocenteBase(usuario);
  const superadmin = usuario?.rol === ROLES.SUPERADMIN;

  return (
    <div className='mx-auto flex max-w-[1100px] flex-col gap-9 px-4 py-6 sm:px-6 md:px-8 md:py-8'>
      <Hero
        saludo={saludoSegunHora()}
        nombre={nombre}
        accesos={docente ? ACCESOS_DOCENTE : ACCESOS_ESTUDIANTE}
        acciones={docente ? ACCIONES_DOCENTE : ACCIONES_ESTUDIANTE}
      />

      {superadmin && <PanelAdmin />}

      {docente ? (
        <>
          <PreviewDudas alcance='facultad' />
          <PreviewMateriales alcance='facultad' />
        </>
      ) : (
        <>
          <PreviewAnuncios />
          <PreviewDudas alcance='carrera' />
          <PreviewMateriales alcance='carrera' />
        </>
      )}

      <PreviewMatchProyectos />
      <PreviewMarketplace />
      <PreviewEspacioCreativo />
    </div>
  );
}