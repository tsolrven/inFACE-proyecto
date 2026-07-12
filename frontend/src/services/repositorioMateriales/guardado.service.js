import { apiFetch } from '../api';

export async function alternarGuardadoApunte(apunteId) {
  const res = await apiFetch(`/guardados/apunte/${apunteId}`, {
    method: 'POST',
  });
  return res.data;
}

export async function alternarGuardadoComentario(comentarioId) {
  const res = await apiFetch(`/guardados/comentario/${comentarioId}`, {
    method: 'POST',
  });
  return res.data;
}

export async function listarGuardados({
  tipo = 'apunte',
  pagina = 1,
  limite = 20,
} = {}) {
  const qs = new URLSearchParams({ tipo, pagina, limite }).toString();
  const res = await apiFetch(`/guardados?${qs}`);
  return { items: res.data, meta: res.meta };
}
