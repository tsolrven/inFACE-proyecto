import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { listarMisReportes } from '@/shared/moderation/reports.api';
import {
  listarReportesModeracion,
  obtenerRespuestasPredeterminadas,
  obtenerReportesDeContenido,
  cerrarReportesDeContenido,
  reintentarCorreoReporte,
} from '@/features/reports/api/moderacion.api';

export const reporteKeys = {
  mios: () => ['reporte', 'mios'],
  cola: (filtros) => ['reporte', 'cola', filtros],
  contenido: (tipo, id) => ['reporte', 'contenido', tipo, id],
  respuestas: () => ['reporte', 'respuestas'],
};
// ────────────────────────────────────────────────────────────────────────────────────────
// staleTime 0: al entrar a la pantalla siempre se vuelve a pedir (el estado de un
// reporte cambia sin que esta pantalla lo sepa: el autor borra, el staff cierra).
export function useMisReportes() {
  return useQuery({
    queryKey: reporteKeys.mios(),
    queryFn: () => listarMisReportes(),
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useColaReportes(filtros) {
  return useInfiniteQuery({
    queryKey: reporteKeys.cola(filtros),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarReportesModeracion({ ...filtros, pagina: pageParam, signal }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useReportesDeContenido(tipo, id) {
  return useQuery({
    queryKey: reporteKeys.contenido(tipo, id),
    queryFn: ({ signal }) => obtenerReportesDeContenido(tipo, id, { signal }),
    enabled: !!tipo && !!id,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Los tres textos predeterminados no cambian mientras la app está abierta.
export function useRespuestasPredeterminadas() {
  return useQuery({
    queryKey: reporteKeys.respuestas(),
    queryFn: ({ signal }) => obtenerRespuestasPredeterminadas({ signal }),
    staleTime: Infinity,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cerrar con `contenido_eliminado` borra el contenido: además de los reportes se
// invalidan las listas de ese tipo y sus guardados.
export function useCerrarReportes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tipo, id, payload }) =>
      cerrarReportesDeContenido(tipo, id, payload),
    onSuccess: (_data, { tipo, payload }) => {
      qc.invalidateQueries({ queryKey: ['reporte'] });
      if (payload.resultado === 'contenido_eliminado') {
        qc.invalidateQueries({ queryKey: [tipo] });
        qc.invalidateQueries({ queryKey: ['guardados', tipo] });
      }
    },
    // si falla (p. ej. 409 porque otro moderador ya cerró), la pantalla se
    // actualiza con el estado real
    onError: () => qc.invalidateQueries({ queryKey: ['reporte'] }),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useReintentarCorreo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reporteId) => reintentarCorreoReporte(reporteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reporte'] }),
  });
}