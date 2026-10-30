import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarApuntes,
  obtenerApunte,
  actualizarApunte,
  eliminarApunte,
} from '@/features/materials/api/materials.api';
import {
  buscarContenido,
  parchearContenido,
  quitarContenido,
} from '@/shared/post/cache';
import { sincronizarArchivos } from '@/shared/api/archivos.api';

export const apunteKeys = {
  list: (filtros) => ['apunte', 'list', filtros],
  detail: (id) => ['apunte', 'detail', id],
};

export function useApuntesFeed(filtros) {
  return useInfiniteQuery({
    queryKey: apunteKeys.list(filtros),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { apuntes, meta } = await listarApuntes({
        ...filtros,
        pagina: pageParam,
        signal,
      });
      return { items: apuntes, meta };
    },
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}

export function useApunte(id) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: apunteKeys.detail(id),
    queryFn: ({ signal }) => obtenerApunte(id, { signal }),
    // al abrir desde el feed se muestra al instante lo que ya se conoce
    placeholderData: () => buscarContenido(qc, 'apunte', id) ?? undefined,
  });
}

// `quitar`: ids de archivos a eliminar · `nuevos`: File[] a subir.
// `payload` null = solo cambian los archivos (el PATCH marca "editado", así que
// no se llama si el texto no cambió).
// Devuelve { apunte, fallos: { quitar, subir } }: cuántas operaciones de
// archivos fallaron (el texto ya quedó guardado).
export function useEditarApunte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload = null,
      quitar = [],
      nuevos = [],
      subirPrimero = false,
    }) => {
      // 1. Texto: si falla, no se toca nada más
      const actualizado = payload ? await actualizarApunte(id, payload) : null;

      // 2. Archivos
      const { fallidosQuitar, fallidosSubir } = await sincronizarArchivos(
        'apunte',
        id,
        { quitar, nuevos, subirPrimero },
      );

      // 3. La respuesta del PATCH trae los archivos de ANTES de sincronizar:
      // si cambiaron, se pide el apunte de nuevo. Si eso falla, null = se
      // invalida y se recarga (mejor que parchear con una lista vieja).
      let apunte = actualizado;
      if (!actualizado || quitar.length > 0 || nuevos.length > 0) {
        try {
          apunte = await obtenerApunte(id);
        } catch {
          apunte = null;
        }
      }

      return {
        apunte,
        fallos: { quitar: fallidosQuitar.length, subir: fallidosSubir.length },
      };
    },
    onSuccess: ({ apunte }, { id }) => {
      if (!apunte) {
        qc.invalidateQueries({ queryKey: ['apunte'] });
        return;
      }
      parchearContenido(qc, 'apunte', id, apunte);
    },
  });
}

export function useEliminarApunte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarApunte(id),
    onSuccess: (_data, id) => {
      quitarContenido(qc, 'apunte', id);
      // marca el detalle como viejo sin pedirlo de nuevo
      qc.invalidateQueries({
        queryKey: apunteKeys.detail(id),
        refetchType: 'none',
      });
      qc.invalidateQueries({ queryKey: ['guardados', 'apunte'] });
    },
  });
}
