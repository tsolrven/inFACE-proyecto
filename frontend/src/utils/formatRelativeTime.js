// Convierte una fecha ISO a texto relativo en español, igual al mockup
// ("hace 2 días", "hace 18 horas", etc.)
export function formatearTiempoRelativo(fechaISO) {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const segundos = Math.floor((ahora - fecha) / 1000);

  if (segundos < 60) return 'hace un momento';

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} hora${horas === 1 ? '' : 's'}`;

  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} día${dias === 1 ? '' : 's'}`;

  const meses = Math.floor(dias / 30);
  if (meses < 12) return `hace ${meses} mes${meses === 1 ? '' : 'es'}`;

  const anios = Math.floor(meses / 12);
  return `hace ${anios} año${anios === 1 ? '' : 's'}`;
}
