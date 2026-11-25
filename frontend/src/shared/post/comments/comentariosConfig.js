import { createContext, useContext } from 'react';

// Configuración de la sección de comentarios que necesitan componentes
// profundos (el compositor de una respuesta anidada) sin pasar props por todo
// el árbol. La provee CommentsSection según el tipo de contenido.
const ComentariosConfig = createContext({ admiteImagen: true });

export const ComentariosConfigProvider = ComentariosConfig.Provider;
export const useComentariosConfig = () => useContext(ComentariosConfig);