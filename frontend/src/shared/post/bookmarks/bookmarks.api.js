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

// `busqueda`: texto de la barra de búsqueda (ya filtrado por busquedaEfectiva).
export async function listarGuardados({
  tipo = 'apunte',
  padre,
  busqueda,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = new URLSearchParams({ tipo, pagina, limite });
  if (padre) qs.set('padre', padre);
  if (busqueda) qs.set('busqueda', busqueda);
  const res = await apiFetch(`/guardados?${qs.toString()}`, { signal });
  return { items: res.data, meta: res.meta };
}
