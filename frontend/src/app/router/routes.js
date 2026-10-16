import { lazy } from 'react';

//! cada página se descarga recién cuando el usuario entra a ella
//! tabla ruta → página. Los textos e íconos del menú están en shared/config/navigation.js

const MaterialsPage = lazy(
  () => import('@/features/materials/pages/MaterialsPage'),
);

export const protectedRoutes = [
  { path: '/', component: lazy(() => import('@/pages/Inicio')) },
  { path: '/populares', component: lazy(() => import('@/pages/Populares')) },
  { path: '/explorar', component: lazy(() => import('@/pages/Explorar')) },

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
    component: lazy(() => import('@/pages/cultural/MatchProyectos')),
  },
  {
    path: '/espacio-creativo',
    component: lazy(() => import('@/pages/cultural/EspacioCreativo')),
  },
  {
    path: '/marketplace',
    component: lazy(() => import('@/pages/cultural/Marketplace')),
  },

  {
    path: '/comunidad/contador-publico-auditor',
    component: lazy(() => import('@/pages/comunidades/ContPublicoAuditor')),
  },
  {
    path: '/comunidad/derecho',
    component: lazy(() => import('@/pages/comunidades/Derecho')),
  },
  {
    path: '/comunidad/ingenieria-civil-informatica',
    component: lazy(() => import('@/pages/comunidades/IngCivilInformatica')),
  },
  {
    path: '/comunidad/ingenieria-comercial',
    component: lazy(() => import('@/pages/comunidades/IngComercial')),
  },
  {
    path: '/comunidad/ingenieria-ejecucion-computacion',
    component: lazy(() => import('@/pages/comunidades/IngEjecComputacion')),
  },

  { path: '/ayuda', component: lazy(() => import('@/pages/recursos/Ayuda')) },
  {
    path: '/reportes',
    component: lazy(() => import('@/pages/recursos/Reportes')),
  },
  {
    path: '/acerca-de-inface',
    component: lazy(() => import('@/pages/recursos/AcercaDeInFace')),
  },

  {
    path: '/reglas',
    component: lazy(() => import('@/pages/legal/ReglasInFace')),
  },
  {
    path: '/privacidad',
    component: lazy(() => import('@/pages/legal/PoliticasPrivacidad')),
  },
  {
    path: '/acuerdos-usuario',
    component: lazy(() => import('@/pages/legal/AcuerdosUsuario')),
  },
];

// rutas que existen pero no van en el sidebar (se llega a ellas navegando, por ej. al hacer click en un hashtag dentro del repositorio de materiales)
export const extraRoutes = [
  { path: '/repositorio-materiales/tag/:hashtag', component: MaterialsPage },
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
