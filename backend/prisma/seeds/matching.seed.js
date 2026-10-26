import { TIPOS_ETIQUETA, ETIQUETAS_CATALOGO } from './data/etiquetas.data.js';

//* SEED MATCHING DE PROYECTOS ─────────────────────────────────────────────────────────────────────────────────────────

export async function seedMatching(prisma) {
    console.log('--- Seed matching de proyectos ---');

    //* Tipos de etiqueta (cómo se agrupan en pantalla)
    const tiposCreados = {};
    for (const nombreTipo of TIPOS_ETIQUETA) {
        const tipo = await prisma.tipoEtiqueta.upsert({
            where: { nombre_tipo_etiqueta: nombreTipo },
            update: {},
            create: { nombre_tipo_etiqueta: nombreTipo },
        });
        tiposCreados[nombreTipo] = tipo;
    }
    console.log(`Tipos de etiqueta: ${TIPOS_ETIQUETA.length}`);

    //* Etiquetas (catálogo en data/etiquetas.data.js). Es idempotente: si ya existen se les
    //* actualiza tipo y descripción, así correr el seed de nuevo no duplica nada.
    const nombres = ETIQUETAS_CATALOGO.map((e) => e.nombre);
    if (new Set(nombres).size !== nombres.length) {
        throw new Error('Hay nombres de etiqueta repetidos en etiquetas.data.js');
    }

    let total = 0;
    for (const e of ETIQUETAS_CATALOGO) {
        const tipo = tiposCreados[e.tipo];
        if (!tipo) throw new Error(`Tipo de etiqueta desconocido: ${e.tipo} (${e.nombre})`);
        const datos = {
            tipo_etiqueta_id: tipo.id,
            descripcion: e.descripcion,
        };
        await prisma.etiqueta.upsert({
            where: { nombre_etiqueta: e.nombre },
            update: datos,
            create: {
                nombre_etiqueta: e.nombre,
                nombre_normalizado: e.nombre.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
                es_predeterminada: true,
                estado: 'aprobada',
                ...datos,
            },
        });
        total++;
    }
    console.log(`Etiquetas: ${total} (creadas o actualizadas)`);

    console.log('--- Seed matching de proyectos completado ---\n');
}