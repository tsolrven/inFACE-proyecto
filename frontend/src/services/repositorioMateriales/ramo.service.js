import { apiFetch } from '../api';

export async function listarCarreras() {
  const res = await apiFetch('/repositorio/carreras');
  return res.data;
}

export async function listarRamosPorCarrera(carreraId) {
  const res = await apiFetch(`/repositorio/carreras/${carreraId}`);
  return res.data;
}
