import { validar } from '../helpers/matching.helper.js';
//──────────────────────────────────────────────────────────────────────────────
// ESQUEMAS
//──────────────────────────────────────────────────────────────────────────────

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

// ╰─────────────────────────────✧────────────────────────────────╮

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

// ╰─────────────────────────────✧────────────────────────────────╮

function esquemaPostular(body) {
    const errores = [];
    const { mensaje_postulacion } = body;

    if (mensaje_postulacion !== undefined && mensaje_postulacion.trim().length > 500)
        errores.push('El mensaje de postulación no puede superar los 500 caracteres');

    return errores;
}

// ╰─────────────────────────────✧────────────────────────────────╮

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
// EXPORTS
//──────────────────────────────────────────────────────────────────────────────

export const validarCrearProyecto = validar(esquemaCrearProyecto);
export const validarActualizarProyecto = validar(esquemaActualizarProyecto);
export const validarPostular = validar(esquemaPostular);
export const validarResponderPostulacion = validar(esquemaResponderPostulacion);