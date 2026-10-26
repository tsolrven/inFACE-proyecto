//* CATÁLOGO DE ETIQUETAS ───────────────────────────────────────────────────────────────────────────────────────────────

export const TIPOS_ETIQUETA = [
    'Tecnología',
    'Área de Interés',
    'Metodología',
    'Habilidad',
    'Administración y Negocios',
    'Economía y Finanzas',
    'Contabilidad y Auditoría',
    'Derecho',
];

const T = 'Tecnología';
const I = 'Área de Interés';
const M = 'Metodología';
const H = 'Habilidad';
const N = 'Administración y Negocios';
const E = 'Economía y Finanzas';
const C = 'Contabilidad y Auditoría';
const D = 'Derecho';

export const ETIQUETAS_CATALOGO = [
    //* ── Tecnología ─────────────────────────────────────────────────────────────────────────────
    { tipo: T, nombre: 'Frontend', descripcion: 'Construcción de la parte visible e interactiva de sitios y aplicaciones web.' },
    { tipo: T, nombre: 'Backend', descripcion: 'Lógica del servidor, APIs y procesamiento de datos que sostienen una aplicación.' },
    { tipo: T, nombre: 'Base de Datos', descripcion: 'Diseño, consulta y administración de bases de datos relacionales y no relacionales.' },
    { tipo: T, nombre: 'Inteligencia Artificial', descripcion: 'Sistemas que aprenden o razonan para resolver tareas, como reconocer texto o imágenes.' },
    { tipo: T, nombre: 'Diseño UX/UI', descripcion: 'Diseño de la experiencia y la interfaz para que un producto digital sea claro y fácil de usar.' },
    { tipo: T, nombre: 'Mobile', descripcion: 'Desarrollo de aplicaciones para celulares y tablets (Android, iOS o multiplataforma).' },
    { tipo: T, nombre: 'DevOps', descripcion: 'Automatización del desarrollo, pruebas y despliegue para entregar software de forma continua.' },
    { tipo: T, nombre: 'Cloud Computing', descripcion: 'Uso de servicios en la nube (servidores, almacenamiento, bases de datos) en vez de infraestructura propia.' },
    { tipo: T, nombre: 'Blockchain', descripcion: 'Registros distribuidos e inalterables, base de criptomonedas y contratos inteligentes.' },
    { tipo: T, nombre: 'Data Science', descripcion: 'Extraer conocimiento de grandes volúmenes de datos con estadística y programación.' },
    { tipo: T, nombre: 'Ciberseguridad', descripcion: 'Proteger sistemas, redes y datos frente a ataques y accesos no autorizados.' },
    { tipo: T, nombre: 'Análisis de Datos', descripcion: 'Limpiar, explorar y visualizar datos para responder preguntas y apoyar decisiones.' },
    { tipo: T, nombre: 'Business Intelligence', descripcion: 'Paneles e indicadores que convierten los datos de una organización en información para decidir.' },
    { tipo: T, nombre: 'ERP y Sistemas de Gestión', descripcion: 'Software que integra finanzas, inventario, ventas y personas de una empresa (SAP, Odoo, etc.).' },
    { tipo: T, nombre: 'Automatización (RPA)', descripcion: 'Robots de software que realizan tareas repetitivas de oficina, como ingresar facturas o conciliar datos.' },
    { tipo: T, nombre: 'Redes y Telecomunicaciones', descripcion: 'Diseño y administración de redes de computadores y comunicaciones.' },
    { tipo: T, nombre: 'Sistemas Operativos', descripcion: 'Funcionamiento y administración de Linux, Windows y otros sistemas que gestionan el computador.' },
    { tipo: T, nombre: 'APIs y Microservicios', descripcion: 'Diseño de servicios pequeños e independientes que se comunican entre sí mediante interfaces.' },
    { tipo: T, nombre: 'Testing y Calidad de Software', descripcion: 'Pruebas manuales y automáticas para detectar fallas y asegurar la calidad de un producto.' },
    { tipo: T, nombre: 'Videojuegos', descripcion: 'Diseño y programación de juegos: mecánicas, gráficos, motores como Unity o Godot.' },
    { tipo: T, nombre: 'Realidad Virtual y Aumentada', descripcion: 'Experiencias inmersivas que mezclan o reemplazan el mundo real con elementos digitales.' },

    //* ── Área de Interés (informática y transversales) ──────────────────────────────────────────
    { tipo: I, nombre: 'Arquitectura de Software', descripcion: 'Decisiones de estructura que determinan cómo se organiza, crece y se mantiene un sistema.' },
    { tipo: I, nombre: 'Desarrollo Web', descripcion: 'Creación de sitios y aplicaciones que funcionan en el navegador.' },
    { tipo: I, nombre: 'IoT', descripcion: 'Dispositivos físicos conectados a internet que recolectan datos o se controlan a distancia.' },
    { tipo: I, nombre: 'Machine Learning', descripcion: 'Modelos que aprenden patrones desde datos para predecir o clasificar.' },
    { tipo: I, nombre: 'Ingeniería de Software', descripcion: 'Métodos para analizar, diseñar, construir y mantener software de calidad en equipo.' },
    { tipo: I, nombre: 'Sistemas de Información', descripcion: 'Cómo las organizaciones capturan, procesan y usan información para operar y decidir.' },
    { tipo: I, nombre: 'Gestión de TI', descripcion: 'Administración de recursos, servicios y proyectos tecnológicos alineados con los objetivos de la empresa.' },
    { tipo: I, nombre: 'Transformación Digital', descripcion: 'Cambiar procesos y modelos de una organización incorporando tecnología digital.' },
    { tipo: I, nombre: 'Interacción Humano-Computador', descripcion: 'Estudio de cómo las personas usan la tecnología para crear sistemas más usables y accesibles.' },
    { tipo: I, nombre: 'Informática Educativa', descripcion: 'Tecnología aplicada a enseñar y aprender: plataformas, contenidos y evaluación digital.' },
    { tipo: I, nombre: 'Software Libre', descripcion: 'Desarrollo y uso de software de código abierto y de las comunidades que lo mantienen.' },
    { tipo: I, nombre: 'Sustentabilidad', descripcion: 'Proyectos con impacto ambiental y social positivo, desde la eficiencia hasta la economía circular.' },
    { tipo: I, nombre: 'Innovación Social', descripcion: 'Ideas y proyectos que resuelven problemas de la comunidad con enfoque colaborativo.' },

    //* ── Metodología ────────────────────────────────────────────────────────────────────────────
    { tipo: M, nombre: 'Scrum', descripcion: 'Marco ágil con ciclos cortos (sprints), roles definidos y reuniones periódicas de seguimiento.' },
    { tipo: M, nombre: 'Kanban', descripcion: 'Gestión visual del trabajo en un tablero, limitando lo que se hace en paralelo.' },
    { tipo: M, nombre: 'XP', descripcion: 'Extreme Programming: prácticas de ingeniería como pruebas continuas y programación en pareja.' },
    { tipo: M, nombre: 'Lean', descripcion: 'Eliminar desperdicio y entregar valor al cliente con la menor cantidad de recursos.' },
    { tipo: M, nombre: 'Design Thinking', descripcion: 'Resolver problemas partiendo de las personas: empatizar, idear, prototipar y probar.' },
    { tipo: M, nombre: 'Lean Startup', descripcion: 'Validar una idea de negocio con pruebas rápidas y baratas antes de invertir en ella.' },
    { tipo: M, nombre: 'Business Model Canvas', descripcion: 'Lienzo de nueve bloques para describir y diseñar cómo un negocio crea y captura valor.' },
    { tipo: M, nombre: 'Six Sigma', descripcion: 'Método estadístico para reducir errores y variabilidad en los procesos.' },
    { tipo: M, nombre: 'Gestión de Riesgos', descripcion: 'Identificar, evaluar y planificar cómo responder a lo que podría salir mal en un proyecto.' },

    //* ── Habilidad ──────────────────────────────────────────────────────────────────────────────
    { tipo: H, nombre: 'Liderazgo', descripcion: 'Guiar y motivar a un equipo hacia un objetivo común.' },
    { tipo: H, nombre: 'Comunicación', descripcion: 'Expresar ideas con claridad y escuchar activamente.' },
    { tipo: H, nombre: 'Resolución de Problemas', descripcion: 'Analizar una situación compleja y encontrar una solución práctica.' },
    { tipo: H, nombre: 'Trabajo en Equipo', descripcion: 'Colaborar, repartir tareas y construir resultados junto a otras personas.' },
    { tipo: H, nombre: 'Gestión de Proyectos', descripcion: 'Planificar plazos, recursos y tareas para llevar un proyecto a buen término.' },
    { tipo: H, nombre: 'Pensamiento Crítico', descripcion: 'Evaluar información y argumentos con criterio antes de tomar una decisión.' },
    { tipo: H, nombre: 'Adaptabilidad', descripcion: 'Ajustarse con rapidez a cambios de contexto, herramientas o prioridades.' },
    { tipo: H, nombre: 'Mentoría', descripcion: 'Acompañar a otras personas en su aprendizaje compartiendo experiencia.' },
    { tipo: H, nombre: 'Creatividad', descripcion: 'Proponer ideas originales y enfoques distintos para un desafío.' },
    { tipo: H, nombre: 'Negociación', descripcion: 'Llegar a acuerdos en los que las partes sienten que ganan algo.' },
    { tipo: H, nombre: 'Oratoria y Presentaciones', descripcion: 'Exponer ideas ante un público de forma clara, ordenada y convincente.' },
    { tipo: H, nombre: 'Redacción y Comunicación Escrita', descripcion: 'Escribir informes, correos y documentos claros y bien estructurados.' },
    { tipo: H, nombre: 'Gestión del Tiempo', descripcion: 'Priorizar y organizar el tiempo para cumplir objetivos sin llegar al límite.' },
    { tipo: H, nombre: 'Investigación', descripcion: 'Buscar, contrastar y sintetizar fuentes para responder una pregunta con rigor.' },
    { tipo: H, nombre: 'Ética Profesional', descripcion: 'Actuar con integridad y responsabilidad en el ejercicio de la profesión.' },

    //* ── Administración y Negocios (Ingeniería Comercial) ───────────────────────────────────────
    { tipo: N, nombre: 'Emprendimiento', descripcion: 'Crear y hacer crecer un negocio propio, desde la idea hasta las primeras ventas.' },
    { tipo: N, nombre: 'Plan de Negocios', descripcion: 'Documento que define mercado, estrategia, operación y finanzas de una idea de negocio.' },
    { tipo: N, nombre: 'Modelos de Negocio', descripcion: 'Cómo una organización crea, entrega y captura valor: suscripción, marketplace, franquicia, etc.' },
    { tipo: N, nombre: 'Estrategia Empresarial', descripcion: 'Definir objetivos de largo plazo y cómo competir para alcanzarlos.' },
    { tipo: N, nombre: 'Marketing Digital', descripcion: 'Promoción de productos en redes sociales, buscadores y correo, midiendo resultados.' },
    { tipo: N, nombre: 'Investigación de Mercado', descripcion: 'Estudiar clientes y competencia con encuestas y datos para decidir qué ofrecer.' },
    { tipo: N, nombre: 'Ventas y Negociación Comercial', descripcion: 'Prospectar clientes, presentar propuestas y cerrar acuerdos comerciales.' },
    { tipo: N, nombre: 'Comercio Electrónico', descripcion: 'Venta de productos y servicios por internet: tiendas online, pagos y despacho.' },
    { tipo: N, nombre: 'Gestión de Personas', descripcion: 'Reclutar, desarrollar y retener talento; clima y cultura organizacional.' },
    { tipo: N, nombre: 'Logística y Cadena de Suministro', descripcion: 'Planificar el flujo de productos desde el proveedor hasta el cliente.' },
    { tipo: N, nombre: 'Gestión de Operaciones', descripcion: 'Diseñar y mejorar los procesos que producen un bien o servicio.' },
    { tipo: N, nombre: 'Comercio Exterior', descripcion: 'Importar y exportar: aduanas, tratados comerciales y logística internacional.' },
    { tipo: N, nombre: 'Innovación y Desarrollo de Productos', descripcion: 'Crear y probar nuevos productos o servicios que respondan a una necesidad real.' },
    { tipo: N, nombre: 'Responsabilidad Social Empresarial', descripcion: 'Cómo una empresa gestiona su impacto en la sociedad y el medioambiente.' },
    { tipo: N, nombre: 'Gestión de la Calidad', descripcion: 'Sistemas y normas (como ISO 9001) para asegurar que se cumplen los estándares.' },

    //* ── Economía y Finanzas ────────────────────────────────────────────────────────────────────
    { tipo: E, nombre: 'Finanzas Corporativas', descripcion: 'Decisiones de inversión y financiamiento de una empresa para crear valor.' },
    { tipo: E, nombre: 'Evaluación de Proyectos', descripcion: 'Estimar si una inversión conviene usando flujos de caja, VAN y TIR.' },
    { tipo: E, nombre: 'Análisis Financiero', descripcion: 'Interpretar estados financieros e indicadores para juzgar la salud de una empresa.' },
    { tipo: E, nombre: 'Microeconomía', descripcion: 'Cómo deciden consumidores y empresas, y cómo se forman los precios en los mercados.' },
    { tipo: E, nombre: 'Macroeconomía', descripcion: 'Crecimiento, inflación, empleo y política económica de un país.' },
    { tipo: E, nombre: 'Mercado de Capitales', descripcion: 'Bolsa de valores, bonos, fondos e instrumentos para invertir y financiarse.' },
    { tipo: E, nombre: 'Econometría', descripcion: 'Estadística aplicada para medir relaciones y probar teorías económicas con datos.' },
    { tipo: E, nombre: 'Finanzas Personales', descripcion: 'Presupuesto, ahorro, deuda e inversión para organizar el dinero propio.' },
    { tipo: E, nombre: 'Fintech', descripcion: 'Tecnología aplicada a servicios financieros: pagos, créditos, billeteras digitales.' },
    { tipo: E, nombre: 'Economía Digital', descripcion: 'Cómo las plataformas y los datos cambian la forma de producir, intercambiar y competir.' },

    //* ── Contabilidad y Auditoría (Contador Público y Auditor) ──────────────────────────────────
    { tipo: C, nombre: 'Contabilidad Financiera', descripcion: 'Registrar y reportar las transacciones de una empresa en estados financieros.' },
    { tipo: C, nombre: 'Contabilidad de Gestión', descripcion: 'Información contable para que la administración planifique y tome decisiones internas.' },
    { tipo: C, nombre: 'Costos y Presupuestos', descripcion: 'Calcular cuánto cuesta producir y planificar ingresos y gastos futuros.' },
    { tipo: C, nombre: 'Tributación', descripcion: 'Impuestos en Chile: IVA, renta, declaraciones y planificación tributaria.' },
    { tipo: C, nombre: 'Auditoría', descripcion: 'Examinar con independencia que la información de una organización sea fiable.' },
    { tipo: C, nombre: 'Auditoría de Sistemas', descripcion: 'Revisar controles, seguridad y confiabilidad de los sistemas informáticos de una organización.' },
    { tipo: C, nombre: 'Auditoría Forense', descripcion: 'Investigar fraudes y delitos económicos reuniendo evidencia contable.' },
    { tipo: C, nombre: 'Control Interno', descripcion: 'Políticas y procedimientos que protegen los activos y evitan errores o fraude.' },
    { tipo: C, nombre: 'Normas Internacionales (IFRS)', descripcion: 'Estándares contables usados en el mundo para presentar información comparable.' },
    { tipo: C, nombre: 'Gobierno Corporativo', descripcion: 'Cómo se dirige y supervisa una organización: directorio, transparencia y rendición de cuentas.' },
    { tipo: C, nombre: 'Contabilidad del Sector Público', descripcion: 'Contabilidad y control del uso de recursos en servicios y organismos del Estado.' },

    //* ── Derecho ────────────────────────────────────────────────────────────────────────────────
    { tipo: D, nombre: 'Derecho Digital', descripcion: 'Normas sobre internet, contratos electrónicos, firma digital y responsabilidad en línea.' },
    { tipo: D, nombre: 'Protección de Datos Personales', descripcion: 'Reglas sobre cómo se pueden recolectar y usar los datos de las personas (Ley 21.719).' },
    { tipo: D, nombre: 'Propiedad Intelectual', descripcion: 'Derechos de autor, marcas y patentes sobre creaciones e ideas.' },
    { tipo: D, nombre: 'Derecho Civil', descripcion: 'Relaciones entre personas: contratos, propiedad, familia y responsabilidad.' },
    { tipo: D, nombre: 'Derecho Comercial', descripcion: 'Normas de sociedades, contratos mercantiles y actividad de las empresas.' },
    { tipo: D, nombre: 'Derecho Laboral', descripcion: 'Relación entre trabajadores y empleadores: contratos, derechos y despido.' },
    { tipo: D, nombre: 'Derecho Penal', descripcion: 'Delitos, penas y garantías del proceso penal.' },
    { tipo: D, nombre: 'Derecho Constitucional', descripcion: 'Organización del Estado y derechos fundamentales de las personas.' },
    { tipo: D, nombre: 'Derechos Humanos', descripcion: 'Protección de la dignidad y las libertades básicas de todas las personas.' },
    { tipo: D, nombre: 'Derecho Ambiental', descripcion: 'Normas para proteger el medioambiente y regular el uso de los recursos naturales.' },
    { tipo: D, nombre: 'Mediación y Resolución de Conflictos', descripcion: 'Alternativas al juicio para acordar soluciones: mediación, conciliación y arbitraje.' },
    { tipo: D, nombre: 'Compliance y Cumplimiento Normativo', descripcion: 'Programas para que una organización cumpla leyes y evite sanciones.' },
];