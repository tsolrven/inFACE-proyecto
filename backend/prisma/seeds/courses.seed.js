//! crea los ramos de cada carerra: recibe "carrerasCreadas" desde seedCareers() en vez de consultarlas de nuevo
import { CURRICULA } from './data/curricula.data.js';

export async function seedCourses(prisma, carrerasCreadas) {
  console.log('--- Seed ramos por carrera ---');

  let totalRamos = 0;

  for (const sigla of Object.keys(CURRICULA)) {
    const { nombre, codigo, semestres } = CURRICULA[sigla];
    const carrera = carrerasCreadas[codigo];

    if (!carrera) {
      throw new Error(
        `No se encontró la carrera "${codigo}" ya sembrada. ¿Corriste seedCareers() antes?`,
      );
    }

    for (let i = 0; i < semestres.length; i++) {
      const semestreGlobal = i + 1;
      const ramosDelSemestre = semestres[i];

      for (let j = 0; j < ramosDelSemestre.length; j++) {
        const nombreRamo = ramosDelSemestre[j];
        const codigoRamo = `${codigo}-${String(semestreGlobal).padStart(2, '0')}-${String(j + 1).padStart(2, '0')}`;

        const ramo = await prisma.ramo.upsert({
          where: { codigo: codigoRamo },
          update: {},
          create: {
            nombre: nombreRamo,
            codigo: codigoRamo,
            semestre: semestreGlobal,
          },
        });

        await prisma.ramoCarrera.upsert({
          where: {
            ramo_id_carrera_id: {
              ramo_id: ramo.id,
              carrera_id: carrera.id,
            },
          },
          update: {},
          create: {
            ramo_id: ramo.id,
            carrera_id: carrera.id,
          },
        });

        totalRamos++;
      }
    }
    console.log(`${nombre}: ${semestres.flat().length} ramos sembrados`);
  }

  console.log(`${totalRamos} ramos sembrados en total.`);
  console.log(`--- Seed ramos por carrera completado ---\n`);
}
