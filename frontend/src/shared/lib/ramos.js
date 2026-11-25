//! presentación de ramos: año y semestre a partir del semestre global (1..n)

export const NUMEROS_ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export function partesSemestre(semestre) {
  const sem = Number(semestre);
  return { anio: Math.ceil(sem / 2), semestreEnAnio: sem % 2 === 0 ? 2 : 1 };
}

// "II año · I semestre"; los ramos sin semestre (0) se agrupan aparte
export function ubicacionDe(semestre) {
  if (!Number(semestre)) return 'Sin semestre';
  const { anio, semestreEnAnio } = partesSemestre(semestre);
  return `${NUMEROS_ROMANOS[anio - 1] ?? anio} año · ${NUMEROS_ROMANOS[semestreEnAnio - 1]} semestre`;
}