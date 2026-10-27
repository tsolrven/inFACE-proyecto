import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/queryClient';
import { obtenerImagen } from '@/shared/api/archivos.api';

const CLAVE = 'imagen-adjunta';

// El cache guarda la URL de objeto ("blob:..."), no el Blob. Cuando TanStack
// elimina la entrada (sin observadores tras gcTime, o queryClient.clear() al
// cerrar sesión) se libera la URL. Así la memoria se gestiona en un solo lugar.
queryClient.getQueryCache().subscribe((evento) => {
  if (evento.type === 'removed' && evento.query.queryKey[0] === CLAVE) {
    const url = evento.query.state.data;
    if (typeof url === 'string') URL.revokeObjectURL(url);
  }
});

/**
 * Descarga una imagen adjunta con la sesión del usuario y devuelve una URL
 * utilizable en <img src>. Las imágenes no cambian por id: no se vuelven a pedir.
 */
export function useImagenAutenticada(archivoId) {
  return useQuery({
    queryKey: [CLAVE, archivoId],
    queryFn: async ({ signal }) => {
      const blob = await obtenerImagen(archivoId, signal);
      if (!blob.type.startsWith('image/')) {
        throw new Error('El archivo no es una imagen');
      }
      return URL.createObjectURL(blob);
    },
    staleTime: Infinity,
    retry: (intentos, error) =>
      !(error?.status >= 400 && error?.status < 500) && intentos < 1,
  });
}
