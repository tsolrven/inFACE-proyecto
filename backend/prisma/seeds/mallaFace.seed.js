const MALLAS = {
  IECI: {
    nombre: 'Ingeniería de Ejecución en Computación e Informática',
    codigo: 'IECI',
    semestres: [
      [
        'Álgebra I',
        'Nociones de Computación e Informática',
        'Algoritmos y Bases de la Programación',
        'Introducción a la Ingeniería',
        'Comunicación y Argumentación',
      ],
      [
        'Álgebra II',
        'Cálculo I',
        'Algoritmos y Programación',
        'Estructuras Discretas para Ciencias de la Computación',
      ],
      [
        'Estadística y Probabilidades',
        'Cálculo II',
        'Estructura de Datos',
        'Administración General',
        'Economía',
      ],
      [
        'Arquitectura de Computadores',
        'Paradigmas de la Programación',
        'Análisis de Algoritmos y Teoría de Autómatas',
        'Inglés I',
        'Práctica Profesional I',
      ],
      [
        'Metodología de Desarrollo',
        'Base de Datos',
        'Sistemas de Información',
        'Sistemas Financieros y Contables',
        'Inglés II',
      ],
      [
        'Inteligencia Artificial',
        'Sistemas Operativos',
        'Ingeniería de Software',
        'Formulación y Evaluación de Proyectos',
        'Inglés III',
        'Electivo de Especialidad I',
      ],
      [
        'Electivo de Especialidad II',
        'Comunicación de Datos y Redes',
        'Taller de Desarrollo',
        'Gestión Empresarial',
        'Inglés IV',
        'Práctica Profesional II',
      ],
      ['Electivo de Especialidad III', 'Proyecto Final de Carrera'],
    ],
  },
  ICINF: {
    nombre: 'Ingeniería Civil en Informática',
    codigo: 'ICINF',
    semestres: [
      [
        'Álgebra y Trigonometría',
        'Introducción a la Ingeniería',
        'Comunicación Oral y Escrita',
        'Introducción a la Programación',
      ],
      [
        'Cálculo Diferencial',
        'Química General',
        'Estructuras Discretas para Ciencias de la Computación',
        'Programación Orientada a Objeto',
      ],
      [
        'Cálculo Integral',
        'Álgebra Lineal',
        'Física Newtoniana',
        'Estructuras de Datos',
        'Inglés I',
        'Administración General',
      ],
      [
        'Cálculo en Varias Variables',
        'Ecuaciones Diferenciales',
        'Electromagnetismo',
        'Modelamiento de Procesos e Información',
        'Inglés II',
      ],
      [
        'Ondas, Óptica y Física Moderna',
        'Sistemas Digitales',
        'Fundamentos de Ciencias de la Computación',
        'Teoría de Sistemas',
        'Inglés III',
        'Gestión Contable',
      ],
      [
        'Estadística y Probabilidades',
        'Economía',
        'Análisis y Diseño de Algoritmos',
        'Base de Datos',
        'Inglés IV',
        'Práctica Profesional I',
      ],
      [
        'Investigación de Operaciones',
        'Arquitectura de Computadores',
        'Administración y Programación de Base de Datos',
        'Sistemas de Información',
        'Gestión Estratégica',
        'Gestión Presupuestaria y Financiera',
      ],
      [
        'Legislación',
        'Sistemas Operativos',
        'Inteligencia Artificial',
        'Ingeniería de Software',
        'Formulación y Evaluación de Proyectos',
        'Práctica Profesional II',
      ],
      [
        'Anteproyecto de Título',
        'Comunicación de Datos y Redes',
        'Electivo Profesional I',
        'Gestión de Proyectos de Software',
        'Gestión de Recursos Humanos',
        'Electivo Profesional II',
        'Electivo Profesional III',
      ],
      [
        'Proyecto de Título',
        'Seguridad Informática',
        'Electivo Profesional IV',
        'Electivo Profesional V',
        'Electivo Profesional VI',
      ],
    ],
  },
  CPA: {
    nombre: 'Contador Público y Auditor',
    codigo: 'CPA',
    semestres: [
      [
        'Álgebra',
        'Fundamentos Contables',
        'Ofimática',
        'Derecho Civil y Comercial',
        'Administración General',
        'Inglés Comunicacional I',
      ],
      [
        'Cálculo I',
        'Procesos Contables',
        'Herramientas para Análisis de Datos',
        'Derecho Laboral',
        'Ética Profesional',
        'Inglés Comunicacional II',
        'Taller de Producción Oral y Escrita',
      ],
      [
        'Cálculo II',
        'Contabilidad Avanzada',
        'Sistemas y Tecnologías para la Gestión',
        'Código Tributario',
        'Gestión de Recursos Humanos',
        'Inglés Comunicacional III',
      ],
      [
        'Estadística',
        'Microeconomía',
        'Contabilidades Específicas',
        'Fundamentos de Costos',
        'Impuestos a las Ventas y Servicios',
        'Administración Estratégica',
        'Inglés Comunicacional IV',
      ],
      [
        'Macroeconomía',
        'Presentación de Estados Financieros',
        'Costos para la Toma de Decisiones',
        'Introducción al Impuesto a la Renta',
        'Marketing',
        'Práctica Profesional I',
      ],
      [
        'Comercio Internacional',
        'Finanzas de Corto Plazo',
        'Formulación y Evaluación de Proyectos',
        'Control Interno',
        'Renta Avanzada',
        'Fundamentos de Auditoría',
        'Taller Profesional I',
      ],
      [
        'Finanzas Largo Plazo',
        'Proyecto de Grado',
        'Electivo I',
        'Auditoría Financiera',
        'Control de Gestión',
        'Taller Profesional II',
      ],
      ['Actividad de Graduación', 'Electivo II', 'Práctica Profesional II'],
    ],
  },
  ICO: {
    nombre: 'Ingeniería Comercial',
    codigo: 'ICO',
    semestres: [
      [
        'Administración General',
        'Derecho Empresarial',
        'Álgebra I',
        'Habilidades Sociales',
        'Contabilidad I',
      ],
      [
        'Administración Estratégica',
        'Álgebra II',
        'Cálculo I',
        'Introducción a la Economía',
        'Contabilidad II',
        'Inglés I',
      ],
      ['Marketing I', 'Cálculo II', 'Microeconomía I', 'Costos', 'Inglés II'],
      [
        'Marketing II',
        'Estadística I',
        'Macroeconomía I',
        'Microeconomía II',
        'Inglés para Negocios I',
        'Inglés III',
      ],
      [
        'Gestión de Recursos Humanos I',
        'Sistemas de Información',
        'Estadísticas II',
        'Macroeconomía II',
        'Gestión Financiera de Corto Plazo',
        'Inglés para Negocios II',
      ],
      [
        'Comportamiento Organizacional',
        'Econometría',
        'Economía Internacional',
        'Mercados de Capitales',
        'Inglés para Negocios III',
        'Práctica Profesional I',
      ],
      [
        'Comercio Exterior',
        'Gestión de Recursos Humanos II',
        'Administración de la Producción',
        'Control de Gestión',
        'Formulación y Evaluación de Proyectos',
      ],
      [
        'Emprendimiento',
        'Desarrollo Organizacional',
        'Responsabilidad Social',
        'Dirección Estratégica I',
        'Gestión Financiera de Largo Plazo',
      ],
      [
        'Electivo I',
        'Electivo II',
        'Electivo III',
        'Dirección Estratégica II',
        'Práctica Profesional II',
      ],
      [
        'Habilitación Profesional',
        'Electivo IV',
        'Electivo V',
        'Taller Integrado',
      ],
    ],
  },
  DER: {
    nombre: 'Derecho',
    codigo: 'DER',
    semestres: [
      [
        'Derecho Romano',
        'Introducción al Derecho',
        'Instituciones Políticas',
        'Microeconomía',
      ],
      [
        'Derecho y Sociedad',
        'Derecho Internacional Público y de los Derechos Humanos',
        'Habilidades Jurídicas Básicas',
        'Macroeconomía',
        'Inglés Comunicacional I',
      ],
      [
        'Persona y Teoría del Acto Jurídico',
        'Administración y Contabilidad',
        'Bases y Órganos Constitucionales',
        'Derecho Procesal Orgánico',
        'Inglés Comunicacional II',
      ],
      [
        'Derechos Reales y Obligaciones',
        'Taller de Integración Jurídica',
        'Derechos y Garantías Constitucionales',
        'Normas Comunes a Todo Procedimiento y Prueba',
        'Teoría General del Derecho Laboral y Contrato Individual de Trabajo',
        'Inglés Comunicacional III',
      ],
      [
        'Efectos de las Obligaciones y Responsabilidad Civil',
        'Teoría del Delito y Derecho Penal Parte General',
        'Actos y Procedimiento Administrativo',
        'Procedimiento Ordinario y Recursos Procesales',
        'Derecho Laboral Colectivo y Procedimiento Laboral',
        'Inglés Comunicacional IV',
      ],
      [
        'Contratos',
        'Derecho Penal Parte Especial',
        'Contratación Administrativa y Función Pública',
        'Procedimiento Ejecutivo y Especiales Contratación Administrativa y Función Pública',
        'Práctica Jurídica',
      ],
      [
        'Derecho de Familia',
        'Estructura de la Obligación Tributaria',
        'Acto de Comercio y Derecho Societario',
        'Derecho Procesal Penal',
        'Informática Jurídica',
        'Negociación',
      ],
      [
        'Derecho Sucesorio',
        'Parte Especial: IVA y Renta',
        'Sociedad Anónima y Títulos de Crédito',
        'Curso de Profundización I',
        'Derecho Informático',
        'Litigación',
      ],
      [
        'Derecho Internacional Privado',
        'Curso de Profundización II',
        'Clínica Jurídica',
        'Litigación Especializada',
      ],
      [
        'Seminario de Licenciatura',
        'Curso de Profundización III',
        'Curso de Profundización IV',
      ],
    ],
  },
};

// recibe el mismo `prisma` que ya crea seed.js, en vez de crear/desconectar el suyo propio.
// devuelve el mapa de carreras creadas (por código), para que seedBase pueda vincular
// a los usuarios de prueba con su carrera sin volver a consultarlas.
export async function seedMallaFace(prisma) {
  const carrerasCreadas = {};

  for (const sigla of Object.keys(MALLAS)) {
    const { nombre, codigo, semestres } = MALLAS[sigla];

    console.log(`Sembrando carrera: ${nombre}...`);
    const carrera = await prisma.carrera.upsert({
      where: { codigo },
      update: {},
      create: { nombre, codigo },
    });
    carrerasCreadas[codigo] = carrera;

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
      }
    }
    console.log(`${nombre}: ${semestres.flat().length} ramos sembrados`);
  }

  console.log('Mallas curriculares sembradas.');
  return carrerasCreadas;
}
