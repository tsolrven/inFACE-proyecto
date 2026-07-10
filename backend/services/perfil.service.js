import { prisma } from '../config/configDb.js';
import logger from '../lib/logger.js';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/appError.js';
import { validarEtiquetasExisten } from './etiqueta.service.js';

const MAX_INTERESES = 15;

//──────────────────────────────────────────────────────────────────────────────
// HELPERS
//──────────────────────────────────────────────────────────────────────────────

function formatearPerfil(usuario, stats = {}) {
    if (!usuario) return null;

    return {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        creado_en: usuario.creado_en,
        nombre_usuario: usuario.perfil?.nombre_usuario ?? null,
        nombre_completo: usuario.perfil?.nombre_completo ?? null,
        biografia: usuario.perfil?.biografia ?? null,
        campus: usuario.perfil?.campus ?? null,
        intereses: (usuario.usuario_etiquetas || []).map((ue) => ({
            id: ue.etiqueta.id,
            nombre: ue.etiqueta.nombre_etiqueta,
            tipo: ue.etiqueta.tipo_etiqueta?.nombre_tipo_etiqueta ?? null,
        })),
        stats: {
            proyectos_creados: stats.proyectos_creados ?? 0,
            postulaciones_enviadas: stats.postulaciones_enviadas ?? 0,
        },
    };
}

function incluirPerfilCompleto() {
    return {
        perfil: true,
        usuario_etiquetas: {
            include: { etiqueta: { include: { tipo_etiqueta: true } } },
        },
    };
}

//──────────────────────────────────────────────────────────────────────────────
// PERFIL (datos básicos)
//──────────────────────────────────────────────────────────────────────────────

async function obtenerPerfilPropio(usuario_id) {
    const [usuario, proyectos_creados, postulaciones_enviadas] = await Promise.all([
        prisma.usuario.findUnique({
            where: { id: usuario_id },
            include: incluirPerfilCompleto(),
        }),
        prisma.proyecto.count({ where: { creador_id: usuario_id } }),
        prisma.postulacionProyecto.count({ where: { postulante_id: usuario_id } }),
    ]);

    if (!usuario) throw new NotFoundError('Usuario');

    return formatearPerfil(usuario, { proyectos_creados, postulaciones_enviadas });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function actualizarPerfil(usuario_id, { nombre_usuario, nombre_completo, biografia, campus }) {
    if (nombre_usuario) {
        const enUso = await prisma.perfil.findFirst({
            where: { nombre_usuario, usuario_id: { not: usuario_id } },
        });
        if (enUso) throw new ConflictError('El nombre de usuario ya está en uso');
    }

    await prisma.perfil.update({
        where: { usuario_id },
        data: {
            ...(nombre_usuario !== undefined && { nombre_usuario }),
            ...(nombre_completo !== undefined && { nombre_completo }),
            ...(biografia !== undefined && { biografia }),
            ...(campus !== undefined && { campus }),
        },
    });

    logger.info('Perfil actualizado', { usuario_id });
    return obtenerPerfilPropio(usuario_id);
}

//──────────────────────────────────────────────────────────────────────────────
// INTERESES (etiquetas del usuario)
//──────────────────────────────────────────────────────────────────────────────

async function actualizarMisEtiquetas(usuario_id, etiqueta_ids = []) {
    if (etiqueta_ids.length > MAX_INTERESES)
        throw new BadRequestError(`Puedes seleccionar como máximo ${MAX_INTERESES} intereses`);

    await validarEtiquetasExisten(etiqueta_ids);

    const unicos = [...new Set(etiqueta_ids)];

    await prisma.$transaction([
        prisma.usuarioEtiqueta.deleteMany({ where: { usuario_id } }),
        ...(unicos.length
            ? [
                prisma.usuarioEtiqueta.createMany({
                    data: unicos.map((etiqueta_id) => ({ usuario_id, etiqueta_id })),
                    skipDuplicates: true,
                }),
            ]
            : []),
    ]);

    logger.info('Intereses de usuario actualizados', { usuario_id, total: unicos.length });
    return obtenerPerfilPropio(usuario_id);
}

export { obtenerPerfilPropio, actualizarPerfil, actualizarMisEtiquetas, MAX_INTERESES };