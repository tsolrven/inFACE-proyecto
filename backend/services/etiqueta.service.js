import { prisma } from '../config/configDb.js';

async function obtenerEtiquetas({ q } = {}) {
    const etiquetas = await prisma.etiqueta.findMany({
        where: {
            estado: 'aprobada',
            ...(q?.trim() && {
                nombre_etiqueta: { contains: q.trim(), mode: 'insensitive' },
            }),
        },
        include: { tipo_etiqueta: true },
        orderBy: [
            { tipo_etiqueta: { nombre_tipo_etiqueta: 'asc' } },
            { nombre_etiqueta: 'asc' },
        ],
    });

    return etiquetas.map((e) => ({
        id: e.id,
        nombre: e.nombre_etiqueta,
        tipo: e.tipo_etiqueta?.nombre_tipo_etiqueta ?? null,
    }));
}

export { obtenerEtiquetas };