import { ValidationError } from '../errors/appError.js';
import logger from '../lib/logger.js';

//──────────────────────────────────────────────────────────────────────────────
// 1. HELPERS DE VALIDACIÓN
//──────────────────────────────────────────────────────────────────────────────

/*
 * Middleware de validación que usa un esquema
 */
function validar(esquema) {
    return (req, res, next) => {
        const errores = esquema(req.body);
        if (errores.length > 0) {
            return next(new ValidationError('Error de validación', errores));
        }
        next();
    };
}

/*
 * Esquema para crear proyecto
 */
function esquemaCrearProyecto(body) {
    const errores = [];
    const { titulo_proyecto, descripcion_proyecto, modalidad_proyecto, maximo_integrantes, fecha_inicio, fecha_fin, etiqueta_ids } = body;

    if (!titulo_proyecto?.trim())
        errores.push('El título del proyecto es obligatorio');
    else if (titulo_proyecto.trim().length < 5)
        errores.push('El título debe tener al menos 5 caracteres');
    else if (titulo_proyecto.trim().length > 200)
        errores.push('El título no puede superar los 200 caracteres');

    if (!descripcion_proyecto?.trim())
        errores.push('La descripción del proyecto es obligatoria');
    else if (descripcion_proyecto.trim().length < 20)
        errores.push('La descripción debe tener al menos 20 caracteres');

    const modalidades = ['remoto', 'presencial', 'hibrido'];
    if (!modalidad_proyecto)
        errores.push('La modalidad del proyecto es obligatoria');
    else if (!modalidades.includes(modalidad_proyecto))
        errores.push(`La modalidad debe ser una de: ${modalidades.join(', ')}`);

    if (maximo_integrantes !== undefined && maximo_integrantes !== null) {
        if (!Number.isInteger(Number(maximo_integrantes)) || Number(maximo_integrantes) < 2)
            errores.push('El máximo de integrantes debe ser un número entero mayor o igual a 2');
    }

    if (fecha_inicio && isNaN(Date.parse(fecha_inicio)))
        errores.push('La fecha de inicio no es válida');

    if (fecha_fin && isNaN(Date.parse(fecha_fin)))
        errores.push('La fecha de fin no es válida');

    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) >= new Date(fecha_fin))
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin');

    if (etiqueta_ids !== undefined) {
        if (!Array.isArray(etiqueta_ids))
            errores.push('Las etiquetas deben ser un arreglo');
        else if (etiqueta_ids.length > 10)
            errores.push('No puedes agregar más de 10 etiquetas');
    }

    return errores;
}

/*
 * Esquema para actualizar proyecto
 */
function esquemaActualizarProyecto(body) {
    const errores = [];
    const { titulo_proyecto, descripcion_proyecto, modalidad_proyecto, maximo_integrantes, fecha_inicio, fecha_fin, estado_proyecto, etiqueta_ids } = body;

    if (titulo_proyecto !== undefined) {
        if (!titulo_proyecto?.trim())
            errores.push('El título no puede estar vacío');
        else if (titulo_proyecto.trim().length < 5)
            errores.push('El título debe tener al menos 5 caracteres');
        else if (titulo_proyecto.trim().length > 200)
            errores.push('El título no puede superar los 200 caracteres');
    }

    if (descripcion_proyecto !== undefined && descripcion_proyecto.trim().length < 20)
        errores.push('La descripción debe tener al menos 20 caracteres');

    if (modalidad_proyecto !== undefined) {
        const modalidades = ['remoto', 'presencial', 'hibrido'];
        if (!modalidades.includes(modalidad_proyecto))
            errores.push(`La modalidad debe ser una de: ${modalidades.join(', ')}`);
    }

    if (estado_proyecto !== undefined) {
        const estados = ['abierto', 'en_progreso', 'cerrado'];
        if (!estados.includes(estado_proyecto))
            errores.push(`El estado debe ser uno de: ${estados.join(', ')}`);
    }

    if (maximo_integrantes !== undefined && maximo_integrantes !== null) {
        if (!Number.isInteger(Number(maximo_integrantes)) || Number(maximo_integrantes) < 2)
            errores.push('El máximo de integrantes debe ser un número entero mayor o igual a 2');
    }

    if (fecha_inicio && isNaN(Date.parse(fecha_inicio)))
        errores.push('La fecha de inicio no es válida');

    if (fecha_fin && isNaN(Date.parse(fecha_fin)))
        errores.push('La fecha de fin no es válida');

    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) >= new Date(fecha_fin))
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin');

    if (etiqueta_ids !== undefined) {
        if (!Array.isArray(etiqueta_ids))
            errores.push('Las etiquetas deben ser un arreglo');
        else if (etiqueta_ids.length > 10)
            errores.push('No puedes agregar más de 10 etiquetas');
    }

    return errores;
}

/*
 * Esquema para postular a un proyecto
 */
function esquemaPostular(body) {
    const errores = [];
    const { mensaje_postulacion } = body;

    if (mensaje_postulacion !== undefined && mensaje_postulacion.trim().length > 500)
        errores.push('El mensaje de postulación no puede superar los 500 caracteres');

    return errores;
}

/*
 * Esquema para responder postulación
 */
function esquemaResponderPostulacion(body) {
    const errores = [];
    const { estado } = body;

    if (!estado)
        errores.push('El estado es obligatorio');
    else if (!['aceptada', 'rechazada'].includes(estado))
        errores.push('El estado debe ser "aceptada" o "rechazada"');

    return errores;
}

//──────────────────────────────────────────────────────────────────────────────
// 2. HELPERS DE PROYECTOS
//──────────────────────────────────────────────────────────────────────────────

/*
 * Define las relaciones que debe incluir Prisma al consultar un proyecto
 */
function incluirProyectoCompleto() {
    return {
        creador: { include: { perfil: true } },
        etiquetas: { include: { etiqueta: { include: { tipo_etiqueta: true } } } },
        integrantes: { include: { usuario: { include: { perfil: true } } } },
        _count: { select: { postulaciones: true, integrantes: true } },
    };
}

/*
 * Formatea un proyecto para la respuesta de la API
 */
function formatearProyecto(p, opciones = {}) {
    if (!p) return null;

    const etiquetasProyectoIds = p.etiquetas?.map((e) => e.etiqueta.id) || [];

    const proyectoFormateado = {
        id: p.id,
        titulo: p.titulo_proyecto,
        descripcion: p.descripcion_proyecto,
        modalidad: p.modalidad_proyecto,
        maximo_integrantes: p.maximo_integrantes,
        estado: p.estado_proyecto,
        fecha_inicio: p.fecha_inicio,
        fecha_fin: p.fecha_fin,
        fecha_creacion: p.fecha_creacion,
        creador: {
            id: p.creador?.id,
            nombre_usuario: p.creador?.perfil?.nombre_usuario,
            nombre_completo: p.creador?.perfil?.nombre_completo,
        },
        etiquetas: p.etiquetas?.map(e => ({
            id: e.etiqueta.id,
            nombre: e.etiqueta.nombre_etiqueta,
            tipo: e.etiqueta.tipo_etiqueta?.nombre_tipo_etiqueta || null,
        })) || [],
        integrantes: p.integrantes?.map(i => ({
            usuario_id: i.usuario_id,
            nombre_usuario: i.usuario?.perfil?.nombre_usuario,
            rol_en_proyecto: i.rol_en_proyecto,
        })) || [],
        total_postulaciones: p._count?.postulaciones || 0,
        total_integrantes: p._count?.integrantes || 0,
    };

    if (opciones.etiquetasUsuarioIds) {
        proyectoFormateado.porcentaje_match = calcularPorcentajeMatch(
            etiquetasProyectoIds,
            opciones.etiquetasUsuarioIds,
        );
    }

    return proyectoFormateado;
}

/*
 * Formatea una lista de proyectos
 */
function formatearProyectos(proyectos, opciones = {}) {
    return proyectos.map((p) => formatearProyecto(p, opciones));
}

//──────────────────────────────────────────────────────────────────────────────
// 3. HELPERS DE POSTULACIONES
//──────────────────────────────────────────────────────────────────────────────

/*
 * Formatea una postulación para la respuesta de la API
 */
function formatearPostulacion(p) {
    if (!p) return null;

    return {
        id: p.id,
        proyecto_id: p.proyecto_id,
        titulo_proyecto: p.proyecto?.titulo_proyecto,
        estado_proyecto: p.proyecto?.estado_proyecto,
        estado: p.estado_postulacion,
        mensaje: p.mensaje_postulacion,
        fecha_postulacion: p.fecha_postulacion,
        postulante: p.postulante ? {
            id: p.postulante.id,
            nombre_usuario: p.postulante.perfil?.nombre_usuario,
            nombre_completo: p.postulante.perfil?.nombre_completo,
        } : undefined,
        creador: p.proyecto?.creador ? {
            id: p.proyecto.creador.id,
            nombre_usuario: p.proyecto.creador.perfil?.nombre_usuario,
            nombre_completo: p.proyecto.creador.perfil?.nombre_completo,
        } : undefined,
    };
}

/*
 * Formatea una lista de postulaciones
 */
function formatearPostulaciones(postulaciones) {
    return postulaciones.map(formatearPostulacion);
}

//──────────────────────────────────────────────────────────────────────────────
// 4. HELPERS DE INTEGRANTES
//──────────────────────────────────────────────────────────────────────────────

/*
 * Formatea un integrante para la respuesta de la API
 */
function formatearIntegrante(i) {
    if (!i) return null;

    return {
        usuario_id: i.usuario_id,
        nombre_usuario: i.usuario?.perfil?.nombre_usuario,
        nombre_completo: i.usuario?.perfil?.nombre_completo,
        rol_en_proyecto: i.rol_en_proyecto,
        fecha_union: i.fecha_union,
    };
}

/*
 * Formatea una lista de integrantes
 */
function formatearIntegrantes(integrantes) {
    return integrantes.map(formatearIntegrante);
}

//──────────────────────────────────────────────────────────────────────────────
// 5. HELPERS DE FILTROS Y PAGINACIÓN
//──────────────────────────────────────────────────────────────────────────────

/*
 * Construye el filtro WHERE para proyectos
 */
function construirFiltroProyectos({ modalidad, estado, etiqueta_ids = [] }) {
    const where = {};

    if (modalidad) {
        where.modalidad_proyecto = modalidad;
    }

    if (estado) {
        where.estado_proyecto = estado;
    }

    if (etiqueta_ids.length > 0) {
        where.etiquetas = {
            some: { etiqueta_id: { in: etiqueta_ids } },
        };
    }

    return where;
}

/*
 * Calcula el skip y take para paginación
 */
function obtenerPaginacion(pagina = 1, limite = 10) {
    return {
        skip: (pagina - 1) * limite,
        take: limite,
    };
}

/*
 * Formatea la respuesta de paginación
 */
function formatearRespuestaPaginada(datos, total, pagina, limite) {
    return {
        datos,
        total,
        pagina,
        limite,
        total_paginas: Math.ceil(total / limite),
    };
}

//──────────────────────────────────────────────────────────────────────────────
// 6. HELPERS DE VALIDACIÓN DE ESTADOS
//──────────────────────────────────────────────────────────────────────────────

/*
 * Valida si un estado de proyecto es válido
 */
function esEstadoProyectoValido(estado) {
    const estados = ['abierto', 'en_progreso', 'cerrado'];
    return estados.includes(estado);
}

/*
 * Valida si una modalidad de proyecto es válida
 */
function esModalidadProyectoValida(modalidad) {
    const modalidades = ['remoto', 'presencial', 'hibrido'];
    return modalidades.includes(modalidad);
}

/*
 * Valida si un estado de postulación es válido
 */
function esEstadoPostulacionValido(estado) {
    const estados = ['pendiente', 'aceptada', 'rechazada'];
    return estados.includes(estado);
}

//──────────────────────────────────────────────────────────────────────────────
// 7. HELPERS DE CONTROLLER (Manejo de errores)
//──────────────────────────────────────────────────────────────────────────────

import { AppError } from '../errors/appError.js';

/*
 * Manejo centralizado de errores del módulo matching
 */
function manejarErrorController(err, res) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            ok: false,
            codigo: err.code,
            mensaje: err.message,
            ...(err.details && { detalles: err.details }),
        });
    }

    // error inesperado — loguear y responder genéricamente
    logger.error('Error inesperado en matching', { error: err.message, stack: err.stack });
    return res.status(500).json({ ok: false, codigo: 'INTERNAL_ERROR', mensaje: 'Error interno del servidor' });
}

//──────────────────────────────────────────────────────────────────────────────
// 8. HELPERS DE CONTROLLER (Wrappers para funciones)
//──────────────────────────────────────────────────────────────────────────────

/*
 * Wrapper para funciones de controller que maneja errores automáticamente
 */
function manejarController(fn) {
    return async (req, res) => {
        try {
            await fn(req, res);
        } catch (err) {
            manejarErrorController(err, res);
        }
    };
}

//──────────────────────────────────────────────────────────────────────────────
// 9. HELPERS DE MATCHING 
//──────────────────────────────────────────────────────────────────────────────
function calcularPorcentajeMatch(etiquetasProyectoIds = [], etiquetasUsuarioIds = []) {
    if (!etiquetasProyectoIds.length || !etiquetasUsuarioIds.length) return 0;

    const setUsuario = new Set(etiquetasUsuarioIds);
    const coincidencias = etiquetasProyectoIds.filter((id) => setUsuario.has(id)).length;

    return Math.round((coincidencias / etiquetasProyectoIds.length) * 100);
}

/*
 * Calcula el % de coincidencia entre dos perfiles (unión de intereses, tipo Jaccard),
 * para "personas con perfil similar". Simétrico: no importa a quién se compare primero.
 */
function calcularPorcentajeMatchPerfiles(etiquetasAIds = [], etiquetasBIds = []) {
    if (!etiquetasAIds.length || !etiquetasBIds.length) return 0;

    const setA = new Set(etiquetasAIds);
    const setB = new Set(etiquetasBIds);
    const interseccion = [...setA].filter((id) => setB.has(id)).length;
    const union = new Set([...setA, ...setB]).size;

    return union ? Math.round((interseccion / union) * 100) : 0;
}

/*
 * Formatea un usuario recomendado por afinidad de intereses ("perfil similar")
 */
function formatearUsuarioSimilar(u, etiquetasCompartidas, porcentaje) {
    return {
        id: u.id,
        nombre_usuario: u.perfil?.nombre_usuario,
        nombre_completo: u.perfil?.nombre_completo,
        campus: u.perfil?.campus,
        porcentaje_match: porcentaje,
        etiquetas_compartidas: etiquetasCompartidas,
    };
}

//──────────────────────────────────────────────────────────────────────────────
// EXPORTS
//──────────────────────────────────────────────────────────────────────────────

export {
    // Validaciones
    validar,
    esquemaCrearProyecto,
    esquemaActualizarProyecto,
    esquemaPostular,
    esquemaResponderPostulacion,

    // Proyectos
    incluirProyectoCompleto,
    formatearProyecto,
    formatearProyectos,

    // Postulaciones
    formatearPostulacion,
    formatearPostulaciones,

    // Integrantes
    formatearIntegrante,
    formatearIntegrantes,

    // Filtros y paginación
    construirFiltroProyectos,
    obtenerPaginacion,
    formatearRespuestaPaginada,

    // Validación de estados
    esEstadoProyectoValido,
    esModalidadProyectoValida,
    esEstadoPostulacionValido,

    // Controller helpers
    manejarErrorController,
    manejarController,

    // Matching de perfiles
    calcularPorcentajeMatchPerfiles,
    formatearUsuarioSimilar,
};