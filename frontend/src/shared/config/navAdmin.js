// Navegación de Administración (solo superadmin). Archivo aparte para no
// tocar navigation.js, que también usa la página Inicio.
// Para añadir un apartado: un ítem acá y su ruta en adminRoutes (routes.js).

export const navAdmin = {
  title: 'Administración',
  items: [
    { path: '/admin/reportes', label: 'Reportes', icon: 'ti-flag' },
    { path: '/admin/usuarios', label: 'Usuarios', icon: 'ti-users' },
  ],
};