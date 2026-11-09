function generacionDesdeCorreo(correo) {
  if (typeof correo !== 'string') return null;
  const local = correo.split('@')[0] ?? '';
  const m = local.match(/(\d{2})\d{2}$/);
  if (!m) return null;

  const anio = 2000 + Number(m[1]);
  const anioActual = new Date().getFullYear();
  if (anio < 2000 || anio > anioActual + 1) return null;
  return anio;
}

export { generacionDesdeCorreo };
