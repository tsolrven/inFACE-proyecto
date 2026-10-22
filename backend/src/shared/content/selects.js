// Lo único que se necesita del autor de un contenido. Con `select` no se carga
// la fila completa de Usuario (correo, contrasena, etc.).
export const AUTOR_PUBLICO_SELECT = {
  id: true,
  perfil: { select: { nombre_usuario: true } },
};
