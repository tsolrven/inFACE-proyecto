// Metadatos de navegación (solo datos, sin JSX ni imports de páginas).
// Los consumen el Sidebar y la página de inicio.
// La relación ruta → página está en app/router/routes.js

export const topNavItems = [
  { path: '/', label: 'Inicio', icon: 'ti-home' },
  {
    path: '/populares',
    label: 'Populares',
    icon: 'ti-trending-up',
    beta: true,
  },
  { path: '/explorar', label: 'Explorar', icon: 'ti-compass', beta: true },
];

export const navSections = [
  {
    title: 'Académico',
    items: [
      {
        path: '/foro-por-ramos',
        label: 'Foro por ramos',
        icon: 'ti-message-circle-2',
      },
      {
        path: '/repositorio-materiales',
        label: 'Repositorio de materiales',
        icon: 'ti-books',
      },
      {
        path: '/anuncios-oficiales',
        label: 'Anuncios oficiales',
        icon: 'ti-speakerphone',
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
      },
      {
        path: '/espacio-creativo',
        label: 'Espacio creativo',
        icon: 'ti-palette',
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: 'ti-shopping-bag',
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
      },
      {
        path: '/comunidad/derecho',
        label: 'Derecho',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/ingenieria-civil-informatica',
        label: 'Ing. Civil en Informática',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/ingenieria-comercial',
        label: 'Ing. Comercial',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/ingenieria-ejecucion-computacion',
        label: 'Ing. Ejec. Computación',
        icon: 'ti-building',
      },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { path: '/ayuda', label: 'Ayuda', icon: 'ti-help-circle' },
      { path: '/reportes', label: 'Reportes', icon: 'ti-flag' },
      {
        path: '/acerca-de-inface',
        label: 'Acerca de InFACE',
        icon: 'ti-info-circle',
      },
    ],
  },
];

export const footerLinks = [
  { path: '/reglas', label: 'Reglas de InFACE' },
  { path: '/privacidad', label: 'Políticas de privacidad' },
  { path: '/acuerdos-usuario', label: 'Acuerdos de usuario' },
];
