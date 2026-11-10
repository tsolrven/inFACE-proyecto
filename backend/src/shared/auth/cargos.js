// Cargos de CEE y tutor por carrera (tabla AsignacionRol). Un cargo está
// vigente si no fue revocado y la fecha de hoy (calendario de Chile) está
// entre `desde` y `hasta`, ambos inclusive: vence al terminar el día `hasta`.

const TIPOS_CARGO = Object.freeze({
  CEE: 'cee',
  TUTOR: 'tutor',
});

// Fecha de hoy en America/Santiago, como Date a medianoche UTC (así se
// compara bien con las columnas @db.Date, que Prisma entrega en ese formato).
function hoyEnChile() {
  const [anio, mes, dia] = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .split('-')
    .map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

// Filtro de Prisma para asignaciones vigentes en la fecha `hoy`.
function filtroCargoVigente(hoy) {
  return { revocada_en: null, desde: { lte: hoy }, hasta: { gte: hoy } };
}

// Cargo vigente del usuario (req.usuario.cargos lo carga `autenticar`).
// Sin filtros devuelve el primero que exista; con { tipo, carrera_id }, el que
// coincida. Devuelve null si no hay.
function cargoVigente(usuario, { tipo, carrera_id } = {}) {
  const cargos = usuario?.cargos ?? [];
  return (
    cargos.find(
      (c) =>
        (!tipo || c.tipo === tipo) && (!carrera_id || c.carrera_id === carrera_id),
    ) ?? null
  );
}

export { TIPOS_CARGO, hoyEnChile, filtroCargoVigente, cargoVigente };