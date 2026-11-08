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

export const extraRoutes = [
  {
    path: '/hashtag/:nombre',
    component: lazy(() => import('@/features/hashtags/pages/HashtagPage')),
  },
  {
    path: '/repositorio-materiales/tag/:hashtag',
    component: lazy(
      () => import('@/features/hashtags/pages/TagMaterialesRedirect'),
    ),
  },
  {
    path: '/perfil',
    component: lazy(() => import('@/features/profile/pages/Perfil')),
  },
  {
    path: '/ajustes',
    component: lazy(() => import('@/features/settings/pages/Ajustes')),
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
  {
    path: '/foro-por-ramos/:id',
    component: lazy(() => import('@/features/forum/pages/HiloDetailPage')),
  },
  {
    path: '/marketplace/nuevo',
    component: lazy(
      () => import('@/features/marketplace/pages/ProductoEditorPage'),
    ),
  },
  {
    path: '/marketplace/producto/:id',
    component: lazy(() => import('@/features/marketplace/pages/ProductoPage')),
  },
  {
    path: '/marketplace/producto/:id/editar',
    component: lazy(
      () => import('@/features/marketplace/pages/ProductoEditorPage'),
    ),
  },
  {
    path: '/espacio-creativo/nueva',
    component: lazy(
      () => import('@/features/creative-space/pages/ObraEditorPage'),
    ),
  },
  {
    path: '/espacio-creativo/obra/:id',
    component: lazy(() => import('@/features/creative-space/pages/ObraPage')),
  },
  {
    path: '/espacio-creativo/obra/:id/editar',
    component: lazy(
      () => import('@/features/creative-space/pages/ObraEditorPage'),
    ),
  },
  {
    path: '/espacio-creativo/hashtag/:nombre',
    component: lazy(
      () => import('@/features/creative-space/pages/HashtagPage'),
    ),
  },
  {
    path: '/espacio-creativo/:espacio',
    component: lazy(
      () => import('@/features/creative-space/pages/EspacioPage'),
    ),
  },
];

export const modalRoutes = [
  {
    path: '/repositorio-materiales/:id',
    component: lazy(
      () => import('@/features/materials/components/MaterialDetailModal'),
    ),
  },
  {
    path: '/foro-por-ramos/:id',
    component: lazy(
      () => import('@/features/forum/components/HiloDetailModal'),
    ),
  },
];