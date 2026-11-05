import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listarFlairs,
  crearFlair,
  actualizarFlair,
  eliminarFlair,
} from '@/features/announcements/api/flairs.api';

export const flairKeys = {
  list: (carreraId) => ['flair', 'list', carreraId],
};

// Los flairs cambian poco: se reutilizan 5 minutos. Al crear, editar o eliminar
// uno se invalida esta clave.
export function useFlairs(carreraId) {
  return useQuery({
    queryKey: flairKeys.list(carreraId),
    queryFn: ({ signal }) => listarFlairs(carreraId, { signal }),
    enabled: !!carreraId,
    staleTime: 5 * 60 * 1000,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Renombrar, cambiar el color o eliminar un flair cambia lo que muestran los
// anuncios ya cargados (tarjetas, detalle y guardados): se vuelven a pedir.
function refrescarAnuncios(qc) {
  qc.invalidateQueries({ queryKey: ['anuncio'] });
  qc.invalidateQueries({ queryKey: ['guardados', 'anuncio'] });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCrearFlair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => crearFlair(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flair'] }),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useActualizarFlair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => actualizarFlair(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flair'] });
      refrescarAnuncios(qc);
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEliminarFlair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarFlair(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flair'] });
      refrescarAnuncios(qc);
    },
  });
}
