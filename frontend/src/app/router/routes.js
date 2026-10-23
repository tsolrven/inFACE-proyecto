import { lazy } from 'react';

//! cada página se descarga recién cuando el usuario entra a ella
//! tabla ruta → página. Los textos e íconos del menú están en shared/config/navigation.js

const MaterialsPage = lazy(
  () => import('@/features/materials/pages/MaterialsPage'),
);

export const protectedRoutes = [
  { path: '/', component: lazy(() => import('@/features/home/pages/Inicio')) },
  { path: '/populares', component: lazy(() => import('@/pages/PopularPage')) },
  { path: '/explorar', component: lazy(() => import('@/pages/ExplorePage')) },

  {
    path: '/foro-por-ramos',
    component: lazy(() => import('@/features/forum/pages/ForumPage')),
  },
  { path: '/repositorio-materiales', component: MaterialsPage },
  {
    path: '/anuncios-oficiales',
    component: lazy(
      () => import('@/features/announcements/pages/AnnouncementsPage'),
    ),
  },

  {
    path: '/match-proyectos',
    component: lazy(
      () => import('@/features/project-match/pages/MatchProyectos'),
    ),
  },
  {
    path: '/espacio-creativo',
    component: lazy(
      () => import('@/features/creative-space/pages/EspacioCreativo'),
    ),
  },
  {
    path: '/marketplace',
    component: lazy(() => import('@/features/marketplace/pages/Marketplace')),
  },

  {
    path: '/comunidad/contador-publico-auditor',
    component: lazy(
      () => import('@/features/communities/pages/ContPublicoAuditor'),
    ),
  },
  {
    path: '/comunidad/derecho',
    component: lazy(() => import('@/features/communities/pages/Derecho')),
  },
  {
    path: '/comunidad/ingenieria-civil-informatica',
    component: lazy(
      () => import('@/features/communities/pages/IngCivilInformatica'),
    ),
  },
  {
    path: '/comunidad/ingenieria-comercial',
    component: lazy(() => import('@/features/communities/pages/IngComercial')),
  },
  {
    path: '/comunidad/ingenieria-ejecucion-computacion',
    component: lazy(
      () => import('@/features/communities/pages/IngEjecComputacion'),
    ),
  },

  {
    path: '/ayuda',
    component: lazy(() => import('@/pages/resources/HelpPage')),
  },
  {
    path: '/reportes',
    component: lazy(() => import('@/features/reports/pages/ReportsPage')),
  },
  {
    path: '/acerca-de-inface',
    component: lazy(() => import('@/pages/resources/AboutPage')),
  },

  {
    path: '/reglas',
    component: lazy(() => import('@/pages/legal/RulesPage')),
  },
  {
    path: '/privacidad',
    component: lazy(() => import('@/pages/legal/PrivacyPolicyPage')),
  },
  {
    path: '/acuerdos-usuario',
    component: lazy(() => import('@/pages/legal/UserAgreementPage')),
  },
];

// rutas que existen pero no van en el sidebar (se llega a ellas navegando, por ej. al hacer click en un hashtag dentro del repositorio de materiales)
export const extraRoutes = [
  { path: '/repositorio-materiales/tag/:hashtag', component: MaterialsPage },
  {
    path: '/perfil',
    component: lazy(() => import('@/features/profile/pages/Perfil')),
  },
  {
    path: '/perfil/usuario/:nombreUsuario',
    component: lazy(() => import('@/features/profile/pages/PerfilPublico')),
  },
  {
    path: '/repositorio-materiales/:id',
    component: lazy(
      () => import('@/features/materials/pages/MaterialDetailPage'),
    ),
  },
];

// rutas que se renderizan COMO MODAL, pero que también funcionan como página normal si alguien entra directo al link.
export const modalRoutes = [
  {
    path: '/repositorio-materiales/:id',
    component: lazy(
      () => import('@/features/materials/components/MaterialDetailModal'),
    ),
  },
];
