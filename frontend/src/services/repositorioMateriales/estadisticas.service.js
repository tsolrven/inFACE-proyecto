import { apiFetch } from '../api';

export async function listarTopColaboradores() {
  const res = await apiFetch('/repositorio/top-colaboradores');
  return res.data;
}

export async function listarHashtagsPopulares() {
  const res = await apiFetch('/repositorio/hashtags-populares');
  return res.data;
}
