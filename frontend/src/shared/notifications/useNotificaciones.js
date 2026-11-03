import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
} from '@/shared/api/notificaciones.api';

const CLAVE = ['notificaciones'];

export function useNotificaciones() {
  const queryClient = useQueryClient();
  const refrescar = () => queryClient.invalidateQueries({ queryKey: CLAVE });

  const consulta = useQuery({
    queryKey: CLAVE,
    queryFn: () => listarNotificaciones({ limite: 20 }),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const leer = useMutation({
    mutationFn: marcarNotificacionLeida,
    onSuccess: refrescar,
  });
  const leerTodas = useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: refrescar,
  });
  const eliminar = useMutation({
    mutationFn: eliminarNotificacion,
    onSuccess: refrescar,
  });

  return {
    items: consulta.data?.items ?? [],
    noLeidas: consulta.data?.no_leidas ?? 0,
    cargando: consulta.isLoading,
    leer: leer.mutate,
    leerTodas: leerTodas.mutate,
    eliminar: eliminar.mutate,
  };
}
