import { apiFetch } from '../api';

export async function reportarApunte(apunteId, payload) {
  const res = await apiFetch(`/reportes/apunte/${apunteId}`, {
    method: 'POST',
    body: payload, // { motivo, detalle?, objetivo? }
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

// Mapa genérico para que <ReportModal /> no tenga que saber qué endpoint
// llamar según el tipo de contenido — así cuando agregues un módulo nuevo
// (foros, perfiles, etc.) solo agregas una entrada acá.
const REPORTAR_POR_TIPO = {
  apunte: reportarApunte,
  comentario: reportarComentario,
};

export async function reportar(tipoContenido, contenidoId, payload) {
  const fn = REPORTAR_POR_TIPO[tipoContenido];
  if (!fn)
    throw new Error(
      `Tipo de contenido "${tipoContenido}" no soporta reportes aún`,
    );
  return fn(contenidoId, payload);
}
