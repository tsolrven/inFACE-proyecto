import { prisma } from '../config/configDb.js';
import logger from '../lib/logger.js';
import {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    ConflictError,
} from '../errors/appError.js';

import {
    incluirProyectoCompleto,
    formatearProyecto,
    formatearProyectos,
    formatearPostulacion,
    formatearPostulaciones,
    formatearIntegrante,
    formatearIntegrantes,
    construirFiltroProyectos,
    obtenerPaginacion,
    formatearRespuestaPaginada,
    esEstadoProyectoValido,
    esModalidadProyectoValida,
    esEstadoPostulacionValido,
} from '../helpers/matchingProyecto.helper.js';

//──────────────────────────────────────────────────────────────────────────────
// PROYECTOS
//──────────────────────────────────────────────────────────────────────────────

async function crearProyecto({ creador_id, titulo_proyecto, descripcion_proyecto, modalidad_proyecto, maximo_integrantes, fecha_inicio, fecha_fin, etiqueta_ids = [] }) {
    logger.debug('Creando proyecto', { creador_id, titulo_proyecto });

    const proyecto = await prisma.proyecto.create({
        data: {
            creador_id,
            titulo_proyecto,
            descripcion_proyecto,
            modalidad_proyecto,
            maximo_integrantes,
            fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
            fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
            etiquetas: {
                create: etiqueta_ids.map(id => ({ etiqueta_id: id })),
            },
        },
        include: incluirProyectoCompleto(),
    });

    logger.info('Proyecto creado', { proyecto_id: proyecto.id });
    return formatearProyecto(proyecto);
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerProyectos({ modalidad, estado, etiqueta_ids = [], creador_id, pagina = 1, limite = 10 }) {
    const skip = (pagina - 1) * limite;

    const where = {
        ...(modalidad && { modalidad_proyecto: modalidad }),
        ...(estado && { estado_proyecto: estado }),
        ...(creador_id && { creador_id }),
        ...(etiqueta_ids.length > 0 && {
            etiquetas: {
                some: { etiqueta_id: { in: etiqueta_ids } },
            },
        }),
    };

    const [proyectos, total] = await Promise.all([
        prisma.proyecto.findMany({
            where,
            skip,
            take: limite,
            orderBy: { fecha_creacion: 'desc' },
            include: incluirProyectoCompleto(),
        }),
        prisma.proyecto.count({ where }),
    ]);

    return {
        datos: proyectos.map(formatearProyecto),
        total,
        pagina,
        total_paginas: Math.ceil(total / limite),
    };
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerProyectoPorId(id) {
    const proyecto = await prisma.proyecto.findUnique({
        where: { id },
        include: incluirProyectoCompleto(),
    });

    if (!proyecto) throw new NotFoundError('Proyecto');

    return formatearProyecto(proyecto);
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function actualizarProyecto(id, usuario_id, rol, datos) {
    const proyecto = await prisma.proyecto.findUnique({ where: { id } });

    if (!proyecto) throw new NotFoundError('Proyecto');
    if (proyecto.creador_id !== usuario_id && rol !== 'superadmin')
        throw new ForbiddenError('No tienes permiso para editar este proyecto');

    const { etiqueta_ids, fecha_inicio, fecha_fin, ...resto } = datos;

    const actualizado = await prisma.proyecto.update({
        where: { id },
        data: {
            ...resto,
            ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
            ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
            ...(etiqueta_ids && {
                etiquetas: {
                    deleteMany: {},
                    create: etiqueta_ids.map(id => ({ etiqueta_id: id })),
                },
            }),
        },
        include: incluirProyectoCompleto(),
    });

    logger.info('Proyecto actualizado', { proyecto_id: id });
    return formatearProyecto(actualizado);
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function eliminarProyecto(id, usuario_id, rol) {
    const proyecto = await prisma.proyecto.findUnique({ where: { id } });

    if (!proyecto) throw new NotFoundError('Proyecto');
    if (proyecto.creador_id !== usuario_id && rol !== 'superadmin')
        throw new ForbiddenError('No tienes permiso para eliminar este proyecto');

    await prisma.proyectoEtiqueta.deleteMany({ where: { proyecto_id: id } });
    await prisma.postulacionProyecto.deleteMany({ where: { proyecto_id: id } });
    await prisma.integranteProyecto.deleteMany({ where: { proyecto_id: id } });
    await prisma.favoritoProyecto.deleteMany({ where: { proyecto_id: id } });
    await prisma.proyecto.delete({ where: { id } });

    logger.info('Proyecto eliminado', { proyecto_id: id, eliminado_por: usuario_id });
    return { mensaje: 'Proyecto eliminado correctamente' };
}

//──────────────────────────────────────────────────────────────────────────────
// POSTULACIONES
//──────────────────────────────────────────────────────────────────────────────

async function postularProyecto({ proyecto_id, postulante_id, mensaje_postulacion }) {
    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyecto_id } });

    if (!proyecto) throw new NotFoundError('Proyecto');
    if (proyecto.estado_proyecto !== 'abierto')
        throw new BadRequestError('El proyecto no está aceptando postulaciones');
    if (proyecto.creador_id === postulante_id)
        throw new BadRequestError('No puedes postularte a tu propio proyecto');

    //* solo bloquear si es integrante activo (no expulsado)
    const yaIntegrante = await prisma.integranteProyecto.findFirst({
        where: { proyecto_id, usuario_id: postulante_id, fue_expulsado: false },
    });
    if (yaIntegrante) throw new ConflictError('Ya eres integrante de este proyecto');

    //* bloquear si ya tiene una postulación pendiente o aceptada
    const yaPostulado = await prisma.postulacionProyecto.findFirst({
        where: {
            proyecto_id,
            postulante_id,
            estado_postulacion: { in: ['pendiente', 'aceptada'] },
        },
    });
    if (yaPostulado) throw new ConflictError('Ya tienes una postulación activa en este proyecto');

    //* verificar si fue expulsado anteriormente para incluir advertencia
    const fueExpulsado = await prisma.integranteProyecto.findFirst({
        where: { proyecto_id, usuario_id: postulante_id, fue_expulsado: true },
    });

    const postulacion = await prisma.postulacionProyecto.create({
        data: { proyecto_id, postulante_id, mensaje_postulacion },
        include: {
            postulante: { include: { perfil: true } },
            proyecto: { select: { titulo_proyecto: true } },
        },
    });

    logger.info('Nueva postulación', { proyecto_id, postulante_id, fue_expulsado_antes: !!fueExpulsado });

    return {
        ...formatearPostulacion(postulacion),
        //* el postulante ve si fue aceptado como aviso propio
        fue_expulsado_anteriormente: !!fueExpulsado,
    };
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerPostulacionesProyecto(proyecto_id, usuario_id, rol) {
    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyecto_id } });

    if (!proyecto) throw new NotFoundError('Proyecto');
    if (proyecto.creador_id !== usuario_id && rol !== 'superadmin')
        throw new ForbiddenError('No tienes permiso para ver estas postulaciones');

    const postulaciones = await prisma.postulacionProyecto.findMany({
        where: { proyecto_id },
        include: { postulante: { include: { perfil: true } } },
        orderBy: { fecha_postulacion: 'desc' },
    });

    //* para cada postulación verificar si el postulante fue expulsado antes
    const postulacionesConHistorial = await Promise.all(
        postulaciones.map(async (p) => {
            const fueExpulsado = await prisma.integranteProyecto.findFirst({
                where: {
                    proyecto_id,
                    usuario_id: p.postulante_id,
                    fue_expulsado: true,
                },
            });

            return {
                ...formatearPostulacion(p),
                //* el creador ve la advertencia si el postulante fue expulsado antes
                advertencia: fueExpulsado
                    ? 'Este usuario fue expulsado anteriormente de este proyecto'
                    : null,
            };
        })
    );

    return postulacionesConHistorial;
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerPostulacionesUsuario(usuario_id) {
    //* todas las postulaciones que ha hecho el usuario, en cualquier proyecto
    const postulaciones = await prisma.postulacionProyecto.findMany({
        where: { postulante_id: usuario_id },
        include: {
            proyecto: {
                include: { creador: { include: { perfil: true } } },
            },
        },
        orderBy: { fecha_postulacion: 'desc' },
    });

    return postulaciones.map(formatearPostulacion);
}

// ╰─────────────────────────────✧────────────────────────────────╮

// ╰─────────────────────────────✧────────────────────────────────╮

async function responderPostulacion(postulacion_id, usuario_id, rol, estado) {
    const postulacion = await prisma.postulacionProyecto.findUnique({
        where: { id: postulacion_id },
        include: { proyecto: true },
    });

    if (!postulacion) throw new NotFoundError('Postulación');
    if (postulacion.proyecto.creador_id !== usuario_id && rol !== 'superadmin')
        throw new ForbiddenError('No tienes permiso para responder esta postulación');
    if (postulacion.estado_postulacion !== 'pendiente')
        throw new BadRequestError('Esta postulación ya fue respondida');

    if (estado === 'aceptada') {
        //* al aceptar: crear integrante y eliminar la postulación
        await prisma.integranteProyecto.create({
            data: {
                proyecto_id: postulacion.proyecto_id,
                usuario_id: postulacion.postulante_id,
                fue_expulsado: false,
            },
        });

        await prisma.postulacionProyecto.delete({ where: { id: postulacion_id } });

        if (postulacion.proyecto.maximo_integrantes) {
            const totalIntegrantes = await prisma.integranteProyecto.count({
                where: { proyecto_id: postulacion.proyecto_id, fue_expulsado: false },
            });

            if (totalIntegrantes >= postulacion.proyecto.maximo_integrantes) {
                await prisma.proyecto.update({
                    where: { id: postulacion.proyecto_id },
                    data: { estado_proyecto: 'en_progreso' },
                });
                logger.info('Proyecto cerrado por máximo de integrantes', { proyecto_id: postulacion.proyecto_id });
            }
        }

        logger.info('Postulación aceptada e integrante agregado', { postulacion_id, proyecto_id: postulacion.proyecto_id });
        return { mensaje: 'Postulación aceptada, el usuario es ahora integrante del proyecto' };
    }

    //* al rechazar: solo cambiar estado, queda visible para el creador
    const actualizada = await prisma.postulacionProyecto.update({
        where: { id: postulacion_id },
        data: { estado_postulacion: 'rechazada' },
    });

    logger.info('Postulación rechazada', { postulacion_id });
    return formatearPostulacion(actualizada);
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function eliminarPostulacion(postulacion_id, usuario_id) {
    //* el postulante retira su propia postulación (solo si está pendiente)
    const postulacion = await prisma.postulacionProyecto.findUnique({
        where: { id: postulacion_id },
    });

    if (!postulacion) throw new NotFoundError('Postulación');
    if (postulacion.postulante_id !== usuario_id)
        throw new ForbiddenError('No puedes eliminar una postulación que no es tuya');
    if (postulacion.estado_postulacion !== 'pendiente')
        throw new BadRequestError('Solo puedes retirar postulaciones pendientes');

    await prisma.postulacionProyecto.delete({ where: { id: postulacion_id } });

    logger.info('Postulación retirada por el postulante', { postulacion_id, usuario_id });
    return { mensaje: 'Postulación retirada correctamente' };
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function eliminarPostulacionRechazada(postulacion_id, usuario_id, rol) {
    //* el creador limpia postulaciones rechazadas
    const postulacion = await prisma.postulacionProyecto.findUnique({
        where: { id: postulacion_id },
        include: { proyecto: true },
    });

    if (!postulacion) throw new NotFoundError('Postulación');
    if (postulacion.proyecto.creador_id !== usuario_id && rol !== 'superadmin')
        throw new ForbiddenError('No tienes permiso para eliminar esta postulación');
    if (postulacion.estado_postulacion !== 'rechazada')
        throw new BadRequestError('Solo puedes eliminar postulaciones rechazadas');

    await prisma.postulacionProyecto.delete({ where: { id: postulacion_id } });

    logger.info('Postulación rechazada eliminada por el creador', { postulacion_id, usuario_id });
    return { mensaje: 'Postulación eliminada correctamente' };
}

//──────────────────────────────────────────────────────────────────────────────
// INTEGRANTES
//──────────────────────────────────────────────────────────────────────────────

async function obtenerIntegrantes(proyecto_id) {
    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyecto_id } });
    if (!proyecto) throw new NotFoundError('Proyecto');

    //* solo mostrar integrantes activos
    const integrantes = await prisma.integranteProyecto.findMany({
        where: { proyecto_id, fue_expulsado: false },
        include: { usuario: { include: { perfil: true } } },
        orderBy: { fecha_union: 'asc' },
    });

    return formatearIntegrantes(integrantes);
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function expulsarIntegrante(proyecto_id, usuario_id_expulsar, usuario_id, rol) {
    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyecto_id } });

    if (!proyecto) throw new NotFoundError('Proyecto');
    if (proyecto.creador_id !== usuario_id && rol !== 'superadmin')
        throw new ForbiddenError('No tienes permiso para expulsar integrantes');
    if (usuario_id_expulsar === proyecto.creador_id)
        throw new BadRequestError('No puedes expulsar al creador del proyecto');

    //* buscar solo integrantes activos
    const integrante = await prisma.integranteProyecto.findFirst({
        where: { proyecto_id, usuario_id: usuario_id_expulsar, fue_expulsado: false },
    });
    if (!integrante) throw new NotFoundError('El usuario no es integrante activo de este proyecto');

    //* eliminar postulaciones del usuario en este proyecto
    await prisma.postulacionProyecto.deleteMany({
        where: { proyecto_id, postulante_id: usuario_id_expulsar },
    });

    //* marcar como expulsado en vez de borrar, conserva historial
    await prisma.integranteProyecto.update({
        where: { id: integrante.id },
        data: {
            fue_expulsado: true,
            fecha_expulsion: new Date(),
        },
    });

    logger.info('Integrante expulsado', { proyecto_id, usuario_id_expulsar });
    return { mensaje: 'Integrante expulsado correctamente' };
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function salirseDeProyecto(proyecto_id, usuario_id) {
    //* el integrante se va voluntariamente
    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyecto_id } });

    if (!proyecto) throw new NotFoundError('Proyecto');
    if (proyecto.creador_id === usuario_id)
        throw new BadRequestError('El creador no puede salirse del proyecto, solo eliminarlo');

    const integrante = await prisma.integranteProyecto.findFirst({
        where: { proyecto_id, usuario_id, fue_expulsado: false },
    });
    if (!integrante) throw new NotFoundError('No eres integrante activo de este proyecto');

    //* salida voluntaria: se elimina el registro (no queda historial negativo)
    await prisma.integranteProyecto.delete({ where: { id: integrante.id } });

    logger.info('Integrante salió voluntariamente', { proyecto_id, usuario_id });
    return { mensaje: 'Saliste del proyecto correctamente' };
}

//──────────────────────────────────────────────────────────────────────────────
// FAVORITOS
//──────────────────────────────────────────────────────────────────────────────

async function toggleFavorito(usuario_id, proyecto_id) {
    const existe = await prisma.favoritoProyecto.findUnique({
        where: { usuario_id_proyecto_id: { usuario_id, proyecto_id } },
    });

    if (existe) {
        await prisma.favoritoProyecto.delete({
            where: { usuario_id_proyecto_id: { usuario_id, proyecto_id } },
        });
        return { guardado: false, mensaje: 'Proyecto eliminado de favoritos' };
    }

    await prisma.favoritoProyecto.create({ data: { usuario_id, proyecto_id } });
    return { guardado: true, mensaje: 'Proyecto guardado en favoritos' };
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerFavoritos(usuario_id) {
    const favoritos = await prisma.favoritoProyecto.findMany({
        where: { usuario_id },
        include: { proyecto: { include: incluirProyectoCompleto() } },
        orderBy: { fecha_creacion: 'desc' },
    });

    return favoritos.map(f => formatearProyecto(f.proyecto));
}

//──────────────────────────────────────────────────────────────────────────────
// PORCETAJE DE MATCHING
//──────────────────────────────────────────────────────────────────────────────
async function obtenerProyectosRecomendados(usuario_id, { pagina = 1, limite = 20 } = {}) {
    const intereses = await prisma.usuarioEtiqueta.findMany({
        where: { usuario_id },
        select: { etiqueta_id: true },
    });
    const etiquetasUsuarioIds = intereses.map((i) => i.etiqueta_id);

    const [postulacionesActivas, integraciones] = await Promise.all([
        prisma.postulacionProyecto.findMany({
            where: { postulante_id: usuario_id, estado_postulacion: { in: ['pendiente', 'aceptada'] } },
            select: { proyecto_id: true },
        }),
        prisma.integranteProyecto.findMany({
            where: { usuario_id, fue_expulsado: false },
            select: { proyecto_id: true },
        }),
    ]);

    const idsExcluidos = [
        ...postulacionesActivas.map((p) => p.proyecto_id),
        ...integraciones.map((i) => i.proyecto_id),
    ];

    const proyectos = await prisma.proyecto.findMany({
        where: {
            estado_proyecto: 'abierto',
            creador_id: { not: usuario_id },
            ...(idsExcluidos.length > 0 && { id: { notIn: idsExcluidos } }),
        },
        include: incluirProyectoCompleto(),
        orderBy: { fecha_creacion: 'desc' },
    });

    //* se calcula el % de coincidencia de cada proyecto y se ordena de mayor a menor
    //* (el sort de JS es estable, así que ante empate se conserva el orden por más reciente)
    const formateados = formatearProyectos(proyectos, { etiquetasUsuarioIds });
    formateados.sort((a, b) => b.porcentaje_match - a.porcentaje_match);

    const total = formateados.length;
    const skip = (pagina - 1) * limite;
    const datos = formateados.slice(skip, skip + limite);

    return {
        datos,
        total,
        pagina,
        total_paginas: Math.ceil(total / limite) || 1,
        tiene_intereses: etiquetasUsuarioIds.length > 0,
    };
}

// ╰─────────────────────────────✧────────────────────────────────╮

export {
    crearProyecto,
    obtenerProyectos,
    obtenerProyectoPorId,
    actualizarProyecto,
    eliminarProyecto,
    postularProyecto,
    obtenerPostulacionesProyecto,
    obtenerPostulacionesUsuario,
    responderPostulacion,
    eliminarPostulacion,
    eliminarPostulacionRechazada,
    obtenerIntegrantes,
    expulsarIntegrante,
    salirseDeProyecto,
    toggleFavorito,
    obtenerFavoritos,
    obtenerProyectosRecomendados,
};