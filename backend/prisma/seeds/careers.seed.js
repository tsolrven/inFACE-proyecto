//! crea carreras de la FACE
import { CURRICULA } from './data/curricula.data.js';

export async function seedCareers(prisma) {
  console.log('--- Seed carreras ---');

  const carrerasCreadas = {};

  for (const sigla of Object.keys(CURRICULA)) {
    const { nombre, codigo } = CURRICULA[sigla];

    console.log(`Carrera: ${nombre}`);
    const carrera = await prisma.carrera.upsert({
      where: { codigo },
      update: {},
      create: { nombre, codigo },
    });
    carrerasCreadas[codigo] = carrera;
  }

  console.log(`${Object.keys(carrerasCreadas).length} carreras sembradas.`);
  console.log(`--- Seed carreras completado ---\n`);
  return carrerasCreadas;
}
