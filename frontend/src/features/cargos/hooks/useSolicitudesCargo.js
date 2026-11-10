import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listarMisSolicitudes,
  crearSolicitud,
  cancelarSolicitud,
} from '@/features/cargos/api/solicitudes.api';
import { subirArchivos } from '@/shared/api/archivos.api';

export const solicitudCargoKeys = {
  mias: ['solicitudCargo', 'mias'],
};

export function useMisSolicitudes() {
  return useQuery({
    queryKey: solicitudCargoKeys.mias,
    queryFn: ({ signal }) => listarMisSolicitudes({ signal }),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Crea la solicitud y después sube los respaldos, uno tras otro. Si un
// respaldo falla, la solicitud ya existe: no se lanza error, se devuelven los
// fallidos para que la pantalla avise.
export function useCrearSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload, archivos = [] }) => {
      const solicitud = await crearSolicitud(payload);
      const { fallidos } = archivos.length
        ? await subirArchivos('solicitud_rol', solicitud.id, archivos)
        : { fallidos: [] };
      return { solicitud, fallidos };
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['solicitudCargo'] }),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCancelarSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelarSolicitud(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['solicitudCargo'] }),
  });
}