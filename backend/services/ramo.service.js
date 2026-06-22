import { prisma } from '../config/configDb.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarRamosPorCarrera(carrera_id) {
  const ramos = await prisma.ramo.findMany({
    where: {
      ramo_carrera: { some: { carrera_id } },
    },
    orderBy: { semestre: 'asc' },
    select: { id: true, nombre: true, codigo: true, semestre: true },
  });

  // agrupa por semestre
  const agrupados = {};
  for (const ramo of ramos) {
    const sem = ramo.semestre || 0;
    if (!agrupados[sem]) agrupados[sem] = [];
    agrupados[sem].push(ramo);
  }

  return agrupados;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function getCarreras() {
  return prisma.carrera.findMany({
    select: { id: true, nombre: true, codigo: true },
    orderBy: { nombre: 'asc' },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarRamosPorCarrera, getCarreras };
