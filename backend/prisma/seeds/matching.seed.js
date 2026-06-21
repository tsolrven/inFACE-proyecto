//* ETIQUETAS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const etiquetas = [
    { nombre_etiqueta: 'Frontend' },
    { nombre_etiqueta: 'Backend' },
    { nombre_etiqueta: 'Base de Datos' },
    { nombre_etiqueta: 'Inteligencia Artificial' },
    { nombre_etiqueta: 'Diseño UX/UI' },
    { nombre_etiqueta: 'Mobile' },
    { nombre_etiqueta: 'DevOps' },
    { nombre_etiqueta: 'Derecho Digital' },
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
    const tipoEtiqueta = await prisma.tipoEtiqueta.upsert({
        where: { id: 1 },
        update: {},
        create: { nombre_tipo_etiqueta: 'Tecnología' },
    });

    //* Etiquetas
    const etiquetasCreadas = {};
    for (const e of etiquetas) {
        const etiqueta = await prisma.etiqueta.upsert({
            where: { nombre_etiqueta: e.nombre_etiqueta },
            update: {},
            create: {
                nombre_etiqueta: e.nombre_etiqueta,
                nombre_normalizado: e.nombre_etiqueta.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
                tipo_etiqueta_id: tipoEtiqueta.id,
                es_predeterminada: true,
                estado: 'aprobada',
            },
        });
        etiquetasCreadas[e.nombre_etiqueta] = etiqueta;
    }
    console.log(`Etiquetas: ${Object.keys(etiquetasCreadas).length} creadas`);

    //* Proyectos
    const usuarioIECI = usuarios['est_ieci'];
    const usuarioICI = usuarios['est_ici'];
    const usuarioDER = usuarios['est_der'];
    const usuarioTutor = usuarios['tutor_test'];

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
            etiquetas: ['Frontend', 'Backend', 'Base de Datos'],
        },
        {
            creador_id: usuarioICI.id,
            titulo_proyecto: 'Sistema de detección de plagio con IA',
            descripcion_proyecto: 'Herramienta que usa NLP para detectar similitudes en trabajos académicos entregados en la plataforma.',
            modalidad_proyecto: 'hibrido',
            maximo_integrantes: 3,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-07-15'),
            fecha_fin: new Date('2026-11-30'),
            etiquetas: ['Inteligencia Artificial', 'Backend'],
        },
        {
            creador_id: usuarioTutor.id,
            titulo_proyecto: 'App mobile de tutorías universitarias',
            descripcion_proyecto: 'Aplicación móvil para conectar tutores con estudiantes, con agenda, chat y calificaciones.',
            modalidad_proyecto: 'remoto',
            maximo_integrantes: 5,
            estado_proyecto: 'abierto',
            fecha_inicio: new Date('2026-08-01'),
            fecha_fin: new Date('2027-01-31'),
            etiquetas: ['Mobile', 'Backend', 'Diseño UX/UI'],
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
            etiquetas: ['Derecho Digital', 'Base de Datos', 'Frontend'],
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
            etiquetas: ['Frontend', 'Diseño UX/UI', 'Base de Datos'],
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