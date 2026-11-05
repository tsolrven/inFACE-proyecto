import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listarMisReportes,
  ocultarMiReporte,
} from '@/shared/moderation/reports.api';

export const reporteKeys = {
  mios: () => ['reporte', 'mios'],
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
// «Quitar de mi lista»: solo oculta (no borra). onSettled y no onSuccess: si
// da 404/409 (reporte ya no es suyo o sigue pendiente) la lista se refresca
// con el estado real.
export function useOcultarReporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reporteId) => ocultarMiReporte(reporteId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['reporte'] }),
  });
}