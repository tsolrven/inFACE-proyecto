import { apiFetch } from '@/shared/api/client';

function conCarrera(path, carreraId) {
  return carreraId ? `${path}?carrera_id=${carreraId}` : path;
}

export async function listarTopColaboradores(carreraId) {
  const res = await apiFetch(
    conCarrera('/repositorio/top-colaboradores', carreraId),
  );
  return res.data;
}

export async function listarHashtagsPopulares(carreraId) {
  const res = await apiFetch(
    conCarrera('/repositorio/hashtags-populares', carreraId),
  );
  return res.data;
}
