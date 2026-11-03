// El backend responde { error: { message, details: [{ field, message }] } } en
// validaciones y apiFetch lo deja en err.message / err.details. Devuelve los
// motivos concretos (sin repetir) o, si no hay, el mensaje general.
export function mensajeDeError(err, porDefecto) {
  const detalles = Array.isArray(err?.details)
    ? [...new Set(err.details.map((d) => d?.message).filter(Boolean))]
    : [];
  return detalles.length ? detalles.join(' · ') : err?.message || porDefecto;
}
