import { apiFetch } from '@/shared/api/client';

export async function alternarGuardado(tipoContenido, id) {
  const res = await apiFetch(`/guardados/${tipoContenido}/${id}`, {
    method: 'POST',
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
