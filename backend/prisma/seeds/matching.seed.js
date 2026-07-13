//* ETIQUETAS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const etiquetas = [
    // Tecnologías (Tipo: Tecnología)
    { nombre_etiqueta: 'Frontend' },
    { nombre_etiqueta: 'Backend' },
    { nombre_etiqueta: 'Base de Datos' },
    { nombre_etiqueta: 'Inteligencia Artificial' },
    { nombre_etiqueta: 'Diseño UX/UI' },
    { nombre_etiqueta: 'Mobile' },
    { nombre_etiqueta: 'DevOps' },
    { nombre_etiqueta: 'Derecho Digital' },
    { nombre_etiqueta: 'Cloud Computing' },
    { nombre_etiqueta: 'Blockchain' },
    { nombre_etiqueta: 'Data Science' },
    { nombre_etiqueta: 'Ciberseguridad' },
    // Habilidades blandas (Tipo: Habilidad)
    { nombre_etiqueta: 'Liderazgo' },
    { nombre_etiqueta: 'Comunicación' },
    { nombre_etiqueta: 'Resolución de Problemas' },
    { nombre_etiqueta: 'Trabajo en Equipo' },
    { nombre_etiqueta: 'Gestión de Proyectos' },
    { nombre_etiqueta: 'Pensamiento Crítico' },
    { nombre_etiqueta: 'Adaptabilidad' },
    { nombre_etiqueta: 'Mentoría' },
    // Áreas de interés (Tipo: Área de Interés)
    { nombre_etiqueta: 'Arquitectura de Software' },
    { nombre_etiqueta: 'Desarrollo Web' },
    { nombre_etiqueta: 'IoT' },
    { nombre_etiqueta: 'Machine Learning' },
    // Metodologías (Tipo: Metodología)
    { nombre_etiqueta: 'Scrum' },
    { nombre_etiqueta: 'Kanban' },
    { nombre_etiqueta: 'XP' },
    { nombre_etiqueta: 'Lean' },
];

//* SEED MATCHING DE PROYECTOS ─────────────────────────────────────────────────────────────────────────────────────────

export async function seedMatching(prisma, contexto) {
    console.log('--- Seed matching de proyectos ---');

    console.log('prisma recibido?', !!prisma);
    console.log('contexto recibido?', !!contexto);
    console.log('usuarios en contexto?', contexto?.usuarios ? Object.keys(contexto.usuarios) : 'no hay usuarios')

    if (!contexto || !contexto.usuarios) {
        console.log('Error: No hay usuarios en el contexto');
        return;
    }

    const { usuarios } = contexto;

    //* Tipo de etiqueta base
    const tiposEtiqueta = ['Tecnología', 'Habilidad', 'Área de Interés', 'Metodología'];
    const tiposCreados = {};

    for (const nombreTipo of tiposEtiqueta) {
        const tipo = await prisma.tipoEtiqueta.upsert({
            where: { nombre_tipo_etiqueta: nombreTipo },
            update: {},
            create: { nombre_tipo_etiqueta: nombreTipo },
        });
        tiposCreados[nombreTipo] = tipo;
        console.log(`Tipo creado: ${nombreTipo}`);
    }

    //* Etiquetas
    const etiquetasCreadas = {};
    for (const e of etiquetas) {
        // Asignar tipo según categoría
        let tipoId;
        const tecnologias = ['Frontend', 'Backend', 'Base de Datos', 'Inteligencia Artificial', 'Diseño UX/UI', 'Mobile', 'DevOps', 'Derecho Digital', 'Cloud Computing', 'Blockchain', 'Data Science', 'Ciberseguridad'];
        const habilidades = ['Liderazgo', 'Comunicación', 'Resolución de Problemas', 'Trabajo en Equipo', 'Gestión de Proyectos', 'Pensamiento Crítico', 'Adaptabilidad', 'Mentoría'];
        const intereses = ['Arquitectura de Software', 'Desarrollo Web', 'IoT', 'Machine Learning'];
        const metodologias = ['Scrum', 'Kanban', 'XP', 'Lean'];

        if (tecnologias.includes(e.nombre_etiqueta)) {
            tipoId = tiposCreados['Tecnología'].id;
        } else if (habilidades.includes(e.nombre_etiqueta)) {
            tipoId = tiposCreados['Habilidad'].id;
        } else if (intereses.includes(e.nombre_etiqueta)) {
            tipoId = tiposCreados['Área de Interés'].id;
        } else if (metodologias.includes(e.nombre_etiqueta)) {
            tipoId = tiposCreados['Metodología'].id;
        }

        const etiqueta = await prisma.etiqueta.upsert({
            where: { nombre_etiqueta: e.nombre_etiqueta },
            update: {},
            create: {
                nombre_etiqueta: e.nombre_etiqueta,
                nombre_normalizado: e.nombre_etiqueta.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
                tipo_etiqueta_id: tipoId,
                es_predeterminada: true,
                estado: 'aprobada',
            },
        });
        etiquetasCreadas[e.nombre_etiqueta] = etiqueta;
    }
    console.log(`Etiquetas: ${Object.keys(etiquetasCreadas).length} creadas`);

    //* Proyectos
    const usuarioIECI = usuarios['est_ieci'];
    const usuarioICINF = usuarios['est_icinf'];
    const usuarioDER = usuarios['est_der'];

    const proyectos = [
        {
            creador_id: usuarioIECI.id,
            titulo_proyecto: 'Plataforma de aprendizaje colaborativo',
            descripcion_proyecto: 'Desarrollo de una plataforma web para que estudiantes compartan recursos y apuntes de forma organizada.',
            modalidad_proyecto: 'remoto',
            maximo_integrantes: 4,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-07-01'),
            fecha_fin: new Date('2026-12-01'),
            etiquetas: ['Frontend', 'Backend', 'Base de Datos', 'Trabajo en Equipo', 'Scrum'],
        },
        {
            creador_id: usuarioICINF.id,
            titulo_proyecto: 'Sistema de detección de plagio con IA',
            descripcion_proyecto: 'Herramienta que usa NLP para detectar similitudes en trabajos académicos entregados en la plataforma.',
            modalidad_proyecto: 'hibrido',
            maximo_integrantes: 3,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-07-15'),
            fecha_fin: new Date('2026-11-30'),
            etiquetas: ['Inteligencia Artificial', 'Backend', 'Machine Learning', 'Data Science', 'Resolución de Problemas'],
        },
        {
            creador_id: usuarioDER.id,
            titulo_proyecto: 'Repositorio de jurisprudencia digital',
            descripcion_proyecto: 'Sistema para indexar y buscar fallos judiciales, con filtros por materia, tribunal y fecha.',
            modalidad_proyecto: 'presencial',
            maximo_integrantes: 3,
            estado_proyecto: 'en_progreso',
            fecha_inicio: new Date('2026-06-01'),
            fecha_fin: new Date('2026-10-01'),
            etiquetas: ['Derecho Digital', 'Base de Datos', 'Frontend', 'Ciberseguridad', 'Pensamiento Crítico'],
        },
        {
            creador_id: usuarioIECI.id,
            titulo_proyecto: 'Dashboard de métricas académicas',
            descripcion_proyecto: 'Panel de control para que docentes visualicen el rendimiento de sus estudiantes en tiempo real.',
            modalidad_proyecto: 'hibrido',
            maximo_integrantes: 4,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-07-10'),
            fecha_fin: new Date('2026-12-15'),
            etiquetas: ['Frontend', 'Diseño UX/UI', 'Base de Datos', 'Data Science', 'Comunicación'],
        },
        {
            creador_id: usuarioDER.id,
            titulo_proyecto: 'Plataforma de contratos inteligentes',
            descripcion_proyecto: 'Desarrollo de una plataforma para gestionar contratos inteligentes basados en blockchain.',
            modalidad_proyecto: 'remoto',
            maximo_integrantes: 4,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-09-01'),
            fecha_fin: new Date('2027-02-28'),
            etiquetas: ['Blockchain', 'Backend', 'Derecho Digital', 'Ciberseguridad', 'Pensamiento Crítico'],
        },
        {
            creador_id: usuarioICINF.id,
            titulo_proyecto: 'Sistema de orquestación de microservicios',
            descripcion_proyecto: 'Plataforma para gestionar y orquestar microservicios en entornos cloud.',
            modalidad_proyecto: 'remoto',
            maximo_integrantes: 4,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-08-15'),
            fecha_fin: new Date('2026-12-20'),
            etiquetas: ['DevOps', 'Backend', 'Cloud Computing', 'Arquitectura de Software', 'Liderazgo'],
        },
        {
            creador_id: usuarioIECI.id,
            titulo_proyecto: 'Sistema de gestión de proyectos ágiles',
            descripcion_proyecto: 'Herramienta para equipos de desarrollo con metodologías ágiles y seguimiento en tiempo real.',
            modalidad_proyecto: 'presencial',
            maximo_integrantes: 5,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-07-20'),
            fecha_fin: new Date('2026-12-10'),
            etiquetas: ['Frontend', 'Backend', 'Base de Datos', 'Scrum', 'Kanban', 'Liderazgo', 'Trabajo en Equipo'],
        },
        {
            creador_id: usuarioICINF.id,
            titulo_proyecto: 'Sistema IoT para monitoreo ambiental',
            descripcion_proyecto: 'Plataforma para monitorear sensores ambientales en tiempo real con análisis de datos.',
            modalidad_proyecto: 'hibrido',
            maximo_integrantes: 4,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-09-15'),
            fecha_fin: new Date('2027-03-15'),
            etiquetas: ['IoT', 'Backend', 'Data Science', 'Cloud Computing', 'Resolución de Problemas'],
        },
        {
            creador_id: usuarioIECI.id,
            titulo_proyecto: 'Plataforma de mentoría tecnológica',
            descripcion_proyecto: 'Espacio para conectar mentores con estudiantes que quieren aprender nuevas tecnologías.',
            modalidad_proyecto: 'remoto',
            maximo_integrantes: 6,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-08-10'),
            fecha_fin: new Date('2027-01-31'),
            etiquetas: ['Desarrollo Web', 'Frontend', 'Backend', 'Mentoría', 'Comunicación', 'Liderazgo'],
        },
        {
            creador_id: usuarioDER.id,
            titulo_proyecto: 'Sistema de gestión de casos legales',
            descripcion_proyecto: 'Plataforma para abogados que permite gestionar casos, documentos y plazos judiciales.',
            modalidad_proyecto: 'hibrido',
            maximo_integrantes: 3,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-08-01'),
            fecha_fin: new Date('2026-12-20'),
            etiquetas: ['Derecho Digital', 'Frontend', 'Base de Datos', 'Ciberseguridad', 'Gestión de Proyectos'],
        },
        {
            creador_id: usuarioICINF.id,
            titulo_proyecto: 'Analizador de sentimientos en redes sociales',
            descripcion_proyecto: 'Herramienta que usa IA para analizar el sentimiento de publicaciones en redes sociales.',
            modalidad_proyecto: 'remoto',
            maximo_integrantes: 3,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-10-01'),
            fecha_fin: new Date('2027-02-28'),
            etiquetas: ['Inteligencia Artificial', 'Machine Learning', 'Data Science', 'Backend', 'Resolución de Problemas'],
        },
    ];
    for (const p of proyectos) {
        const { etiquetas: etiquetasProyecto, ...datos } = p;

        // evita duplicar proyectos si se corre el seed más de una vez
        const yaExiste = await prisma.proyecto.findFirst({
            where: { titulo_proyecto: p.titulo_proyecto },
        });
        if (yaExiste) {
            console.log(`Proyecto ya existía, se omite: ${p.titulo_proyecto}`);
            continue;
        }

        await prisma.proyecto.create({
            data: {
                ...datos,
                etiquetas: {
                    create: etiquetasProyecto.map(nombre => ({
                        etiqueta_id: etiquetasCreadas[nombre].id,
                    })),
                },
            },
        });
        console.log(`Proyecto: ${p.titulo_proyecto}`);
    }

    console.log('--- Seed matching de proyectos completado ---\n');
}