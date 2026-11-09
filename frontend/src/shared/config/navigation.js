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
        beta: true,
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: 'ti-shopping-bag',
        beta: true,
      },
    ],
  },
  {
    title: 'Comunidades',
    items: [
      {
        path: '/comunidad/cpa',
        label: 'Cont. Público y Auditor',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/der',
        label: 'Derecho',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/icinf',
        label: 'Ing. Civil en Informática',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/ico',
        label: 'Ing. Comercial',
        icon: 'ti-building',
      },
      {
        path: '/comunidad/ieci',
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