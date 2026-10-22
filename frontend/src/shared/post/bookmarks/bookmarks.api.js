import { apiFetch } from '@/shared/api/client';

export async function guardarContenido(tipoContenido, id) {
  const res = await apiFetch(`/guardados/${tipoContenido}/${id}`, {
    method: 'PUT',
  });
  return res.data;
}

export async function quitarGuardado(tipoContenido, id) {
  const res = await apiFetch(`/guardados/${tipoContenido}/${id}`, {
    method: 'DELETE',
  });
  return res.data;
}

export async function listarGuardados({
  tipo = 'apunte',
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = new URLSearchParams({ tipo, pagina, limite }).toString();
  const res = await apiFetch(`/guardados?${qs}`, { signal });
  return { items: res.data, meta: res.meta };
}
