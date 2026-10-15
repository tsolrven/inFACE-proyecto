import { lazy } from 'react';

//! cada página se descarga recién cuando el usuario entra a ella
const Inicio = lazy(() => import('../pages/Inicio'));
const Populares = lazy(() => import('../pages/Populares'));
const Explorar = lazy(() => import('../pages/Explorar'));

const ForoPorRamos = lazy(() => import('../pages/academico/ForoPorRamos'));
const RepositorioMateriales = lazy(
  () => import('../pages/academico/RepositorioMateriales'),
);
const AnunciosOficiales = lazy(
  () => import('../pages/academico/AnunciosOficiales'),
);

const MatchProyectos = lazy(() => import('../pages/cultural/MatchProyectos'));
const EspacioCreativo = lazy(() => import('../pages/cultural/EspacioCreativo'));
const Marketplace = lazy(() => import('../pages/cultural/Marketplace'));

const ContPublicoAuditor = lazy(
  () => import('../pages/comunidades/ContPublicoAuditor'),
);
const Derecho = lazy(() => import('../pages/comunidades/Derecho'));
const IngCivilInformatica = lazy(
  () => import('../pages/comunidades/IngCivilInformatica'),
);
const IngComercial = lazy(() => import('../pages/comunidades/IngComercial'));
const IngEjecComputacion = lazy(
  () => import('../pages/comunidades/IngEjecComputacion'),
);

const Ayuda = lazy(() => import('../pages/recursos/Ayuda'));
const Reportes = lazy(() => import('../pages/recursos/Reportes'));
const AcercaDeInFace = lazy(() => import('../pages/recursos/AcercaDeInFace'));

const ReglasInFace = lazy(() => import('../pages/legal/ReglasInFace'));
const PoliticasPrivacidad = lazy(
  () => import('../pages/legal/PoliticasPrivacidad'),
);
const AcuerdosUsuario = lazy(() => import('../pages/legal/AcuerdosUsuario'));

const MaterialDetailModal = lazy(
  () => import('../features/materials/components/MaterialDetailModal'),
);
// ──────────────────────────────────────────────────────────────────────────
export const topNavItems = [
  { path: '/', label: 'Inicio', icon: 'ti-home', element: <Inicio /> },
  {
    path: '/populares',
    label: 'Populares',
    icon: 'ti-trending-up',
    beta: true,
    element: <Populares />,
  },
  {
    path: '/explorar',
    label: 'Explorar',
    icon: 'ti-compass',
    beta: true,
    element: <Explorar />,
  },
];
// ──────────────────────────────────────────────────────────────────────────
export const navSections = [
  {
    title: 'Académico',
    items: [
      {
        path: '/foro-por-ramos',
        label: 'Foro por ramos',
        icon: 'ti-message-circle-2',
        element: <ForoPorRamos />,
      },
      {
        path: '/repositorio-materiales',
        label: 'Repositorio de materiales',
        icon: 'ti-books',
        element: <RepositorioMateriales />,
      },
      {
        path: '/anuncios-oficiales',
        label: 'Anuncios oficiales',
        icon: 'ti-speakerphone',
        element: <AnunciosOficiales />,
      },
    ],
  },
  {
    title: 'Cultural',
    items: [
      {
        path: '/match-proyectos',
        label: 'Match de proyectos',
        icon: 'ti-puzzle',
        element: <MatchProyectos />,
      },
      {
        path: '/espacio-creativo',
        label: 'Espacio creativo',
        icon: 'ti-palette',
        element: <EspacioCreativo />,
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: 'ti-shopping-bag',
        element: <Marketplace />,
      },
    ],
  },
  {
    title: 'Comunidades',
    items: [
      {
        path: '/comunidad/contador-publico-auditor',
        label: 'Cont. Público y Auditor',
        icon: 'ti-building',
        element: <ContPublicoAuditor />,
      },
      {
        path: '/comunidad/derecho',
        label: 'Derecho',
        icon: 'ti-building',
        element: <Derecho />,
      },
      {
        path: '/comunidad/ingenieria-civil-informatica',
        label: 'Ing. Civil en Informática',
        icon: 'ti-building',
        element: <IngCivilInformatica />,
      },
      {
        path: '/comunidad/ingenieria-comercial',
        label: 'Ing. Comercial',
        icon: 'ti-building',
        element: <IngComercial />,
      },
      {
        path: '/comunidad/ingenieria-ejecucion-computacion',
        label: 'Ing. Ejec. Computación',
        icon: 'ti-building',
        element: <IngEjecComputacion />,
      },
    ],
  },
  {
    title: 'Recursos',
    items: [
      {
        path: '/ayuda',
        label: 'Ayuda',
        icon: 'ti-help-circle',
        element: <Ayuda />,
      },
      {
        path: '/reportes',
        label: 'Reportes',
        icon: 'ti-flag',
        element: <Reportes />,
      },
      {
        path: '/acerca-de-inface',
        label: 'Acerca de InFACE',
        icon: 'ti-info-circle',
        element: <AcercaDeInFace />,
      },
    ],
  },
];
// ──────────────────────────────────────────────────────────────────────────
export const footerLinks = [
  { path: '/reglas', label: 'Reglas de InFACE', element: <ReglasInFace /> },
  {
    path: '/privacidad',
    label: 'Políticas de privacidad',
    element: <PoliticasPrivacidad />,
  },
  {
    path: '/acuerdos-usuario',
    label: 'Acuerdos de usuario',
    element: <AcuerdosUsuario />,
  },
];
// ──────────────────────────────────────────────────────────────────────────
export const allProtectedRoutes = [
  ...topNavItems,
  ...navSections.flatMap((section) => section.items),
  ...footerLinks,
];
// ──────────────────────────────────────────────────────────────────────────
// rutas que existen pero no van en el sidebar (se llega a ellas navegando por ej al hacer click en un hashtag dentro del repositorio de materiales)
export const extraRoutes = [
  {
    path: '/repositorio-materiales/tag/:hashtag',
    element: <RepositorioMateriales />,
  },
];
// ──────────────────────────────────────────────────────────────────────────
// rutas que se renderizan COMO MODAL, pero que también funcionan como página normal si alguien entra directo al link.
export const modalRoutes = [
  {
    path: '/repositorio-materiales/:id',
    element: <MaterialDetailModal />,
  },
];
