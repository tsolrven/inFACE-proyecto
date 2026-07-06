import { apiFetch } from '../api';

export async function listarCarreras() {
  const res = await apiFetch('/repositorio/carreras');
  return res.data;
}

// devuelve los ramos de una carrera, agrupados por semestre
// (shape: { [semestre]: Ramo[] }, tal cual arma ramo.service.js del backend)
export async function listarRamosPorCarrera(carreraId) {
  const res = await apiFetch(`/repositorio/carreras/${carreraId}`);
  return res.data;
}
