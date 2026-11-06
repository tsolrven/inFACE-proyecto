import { formatearFechaSancion } from '@/shared/moderation/sancionUi';

// El backend responde { error: { message, details } }. apiFetch lo deja en
// err.message / err.code / err.details.
// - Validaciones: details es un array de { field, message }: se devuelven los
//   motivos concretos (sin repetir).
// - CUENTA_RESTRINGIDA / CUENTA_SUSPENDIDA: details es un objeto
//   { motivo, hasta } (hasta null = sin término): se compone el mensaje con el
//   motivo y la fecha de término.
// - Cualquier otro caso: el mensaje general.
// Agrega el punto final solo si el texto no termina ya en puntuación
// (la fecha en es-CL termina en «p. m.»).
function conPunto(texto) {
  return /[.!?…]$/.test(texto) ? texto : `${texto}.`;
}

function mensajeDeSancion(err) {
  const { motivo, hasta } = err.details ?? {};
  const partes = [conPunto(err.message)];
  if (motivo) partes.push(conPunto(`Motivo: ${motivo.trim()}`));
  if (hasta) {
    partes.push(conPunto(`Vigente hasta ${formatearFechaSancion(hasta)}`));
  } else if (err.code === 'CUENTA_SUSPENDIDA') {
    partes.push('Suspensión permanente.');
  }
  return partes.join(' ');
}

export function mensajeDeError(err, porDefecto) {
  if (
    (err?.code === 'CUENTA_RESTRINGIDA' || err?.code === 'CUENTA_SUSPENDIDA') &&
    err.details &&
    !Array.isArray(err.details)
  ) {
    return mensajeDeSancion(err);
  }

  const detalles = Array.isArray(err?.details)
    ? [...new Set(err.details.map((d) => d?.message).filter(Boolean))]
    : [];
  return detalles.length ? detalles.join(' · ') : err?.message || porDefecto;
}