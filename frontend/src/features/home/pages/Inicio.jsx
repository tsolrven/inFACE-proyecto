import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES, esDocenteBase } from '@/shared/auth/roles';
import { rutas as rutasMarketplace } from '@/features/marketplace/utils/catalogo';
import { rutas as rutasCreativo } from '@/features/creative-space/utils/espacios';
import Hero from '@/features/home/components/Hero';
import PanelPestanas from '@/features/home/components/PanelPestanas';
import { useDudasInicio } from '@/features/home/hooks/useDudasInicio';
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

const PESTANAS_COMUNIDAD = [
  {
    id: 'match',
    label: 'Match de proyectos',
    icon: 'ti-puzzle',
    to: '/match-proyectos',
    contenido: <PreviewMatchProyectos embebida />,
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: 'ti-shopping-bag',
    to: rutasMarketplace.inicio,
    contenido: <PreviewMarketplace embebida />,
  },
  {
    id: 'creativo',
    label: 'Espacio creativo',
    icon: 'ti-palette',
    to: rutasCreativo.inicio,
    contenido: <PreviewEspacioCreativo embebida />,
  },
];

// Arma la página según el rol. El superadmin ve la variante de su rol base
// (estudiante o docente) con el panel de administración arriba.
export default function Inicio() {
  const usuario = useAuthStore((s) => s.usuario);
  const nombre =
    (usuario?.nombre_completo || '').split(' ')[0] ||
    usuario?.nombre_usuario ||
    '';
  const docente = esDocenteBase(usuario);
  const superadmin = usuario?.rol === ROLES.SUPERADMIN;
  const alcance = docente ? 'facultad' : 'carrera';

  // solo para el número de la pestaña: PreviewDudas usa la misma caché
  const { total: totalDudas } = useDudasInicio(alcance);

  const pestanaDudas = {
    id: 'dudas',
    label: 'Dudas sin resolver',
    icon: 'ti-message-question',
    contador: totalDudas,
    to: docente ? undefined : '/foro-por-ramos',
    contenido: (
      <PreviewDudas
        alcance={alcance}
        embebida
      />
    ),
  };
  const pestanaMateriales = {
    id: 'materiales',
    label: 'Materiales',
    icon: 'ti-books',
    to: docente ? undefined : '/repositorio-materiales',
    contenido: (
      <PreviewMateriales
        alcance={alcance}
        embebida
      />
    ),
  };
  const pestanasAcademicas = docente
    ? [pestanaDudas, pestanaMateriales]
    : [
      {
        id: 'anuncios',
        label: 'Anuncios',
        icon: 'ti-speakerphone',
        to: '/anuncios-oficiales',
        contenido: <PreviewAnuncios embebida />,
      },
      pestanaDudas,
      pestanaMateriales,
    ];

  return (
    <div className='mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-6 sm:px-6 md:px-8 md:py-8'>
      <Hero
        saludo={saludoSegunHora()}
        nombre={nombre}
        accesos={docente ? ACCESOS_DOCENTE : ACCESOS_ESTUDIANTE}
        acciones={docente ? ACCIONES_DOCENTE : ACCIONES_ESTUDIANTE}
      />

      {superadmin && <PanelAdmin />}

      <PanelPestanas
        titulo={docente ? 'Facultad' : 'Tu carrera'}
        icono={docente ? 'ti-building-community' : 'ti-school'}
        claveMemoria={docente ? 'facultad' : 'carrera'}
        pestanas={pestanasAcademicas}
      />

      <PanelPestanas
        titulo='Comunidad'
        icono='ti-users'
        claveMemoria='comunidad'
        pestanas={PESTANAS_COMUNIDAD}
      />
    </div>
  );
}