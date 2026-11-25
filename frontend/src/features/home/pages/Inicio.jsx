import { useAuthStore } from '@/shared/auth/authStore';
import Hero from '@/features/home/components/Hero';
import {
  ACCESOS_ESTUDIANTE,
  ACCIONES_ESTUDIANTE,
} from '@/features/home/utils/accesosInicio';
import PreviewMatchProyectos from '@/features/home/sections/PreviewMatchProyectos';
import PreviewMateriales from '@/features/home/sections/PreviewMateriales';
import PreviewMarketplace from '@/features/home/sections/PreviewMarketplace';
import PreviewEspacioCreativo from '@/features/home/sections/PreviewEspacioCreativo';

function saludoSegunHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// Solo arma la página: cada sección vive en features/home/sections y trae sus
// propios datos. En la parte 3, el orden y las secciones dependen del rol.
export default function Inicio() {
  const usuario = useAuthStore((s) => s.usuario);
  const nombre =
    (usuario?.nombre_completo || '').split(' ')[0] ||
    usuario?.nombre_usuario ||
    '';

  return (
    <div className='mx-auto flex max-w-[1100px] flex-col gap-9 px-4 py-6 sm:px-6 md:px-8 md:py-8'>
      <Hero
        saludo={saludoSegunHora()}
        nombre={nombre}
        accesos={ACCESOS_ESTUDIANTE}
        acciones={ACCIONES_ESTUDIANTE}
      />

      <PreviewMatchProyectos />
      <PreviewMateriales />
      <PreviewMarketplace />
      <PreviewEspacioCreativo />
    </div>
  );
}