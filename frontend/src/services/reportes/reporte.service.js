import { apiFetch } from '../api';

export async function reportarApunte(apunteId, payload) {
  const res = await apiFetch(`/reportes/apunte/${apunteId}`, {
    method: 'POST',
    body: payload, 
  });
  return res.data;
}

export async function reportarComentario(comentarioId, payload) {
  const res = await apiFetch(`/reportes/comentario/${comentarioId}`, {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

const REPORTAR_POR_TIPO = {
  apunte: reportarApunte,
  comentario: reportarComentario,
};

export async function reportar(tipoContenido, contenidoId, payload) {
  const fn = REPORTAR_POR_TIPO[tipoContenido];
  if (!fn) throw new Error(`Tipo de contenido "${tipoContenido}" no soporta reportes aún`);
  return fn(contenidoId, payload);
}

export async function listarMisReportes() {
  const res = await apiFetch('/reportes/me');
  return res.data;
}
