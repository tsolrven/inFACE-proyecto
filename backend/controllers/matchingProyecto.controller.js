import {
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
        descartarProyecto,
        obtenerHabilidadesEnDemanda,
        obtenerUsuariosSimilares,
} from '../services/matchingProyecto.service.js';
import { manejarController } from '../helpers/matchingProyecto.helper.js';

//──────────────────────────────────────────────────────────────────────────────
// PROYECTOS
//──────────────────────────────────────────────────────────────────────────────

async function crearController(req, res) {
        const proyecto = await crearProyecto({ creador_id: req.usuario.id, ...req.body });
        res.status(201).json({ ok: true, data: proyecto });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function listarController(req, res) {
        const { modalidad, estado, etiquetas, creador_id, integrante_id, pagina, limite } = req.query;
        const etiqueta_ids = etiquetas ? etiquetas.split(',') : [];

        const resultado = await obtenerProyectos({
                modalidad,
                estado,
                etiqueta_ids,
                creador_id,
                integrante_id,
                pagina: Number(pagina) || 1,
                limite: Number(limite) || 10,
        });

        res.json({
                ok: true,
                datos: resultado.datos,
                total: resultado.total,
                pagina: resultado.pagina,
                total_paginas: resultado.total_paginas,
        });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function listarMisProyectosController(req, res) {
        const resultado = await obtenerProyectos({
                creador_id: req.usuario.id,
                pagina: 1,
                limite: 100,
        });

        res.json({
                ok: true,
                datos: resultado.datos,
                total: resultado.total,
                pagina: resultado.pagina,
                total_paginas: resultado.total_paginas,
        });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerUnoController(req, res) {
        const proyecto = await obtenerProyectoPorId(req.params.id, req.usuario?.id);
        res.json({ ok: true, data: proyecto });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function actualizarController(req, res) {
        const proyecto = await actualizarProyecto(
                req.params.id,
                req.usuario.id,
                req.usuario.rol,
                req.body,
        );
        res.json({ ok: true, data: proyecto });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function eliminarController(req, res) {
        const resultado = await eliminarProyecto(req.params.id, req.usuario.id, req.usuario.rol);
        res.json({ ok: true, mensaje: resultado.mensaje });
}

//──────────────────────────────────────────────────────────────────────────────
// POSTULACIONES
//──────────────────────────────────────────────────────────────────────────────

async function postularController(req, res) {
        const postulacion = await postularProyecto({
                proyecto_id: req.params.id,
                postulante_id: req.usuario.id,
                mensaje_postulacion: req.body.mensaje_postulacion,
        });
        res.status(201).json({ ok: true, data: postulacion });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function listarPostulacionesController(req, res) {

        const postulaciones = await obtenerPostulacionesProyecto(
                req.params.id,
                req.usuario.id,
                req.usuario.rol,
                { soloPendientes: req.query.todas !== 'true' },
        );
        res.json({ ok: true, data: postulaciones });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function listarPostulacionesUsuarioController(req, res) {
        const postulaciones = await obtenerPostulacionesUsuario(req.usuario.id);
        res.json({ ok: true, data: postulaciones });
}

// ╰─────────────────────────────✧────────────────────────────────╮

// ╰─────────────────────────────✧────────────────────────────────╮

async function responderPostulacionController(req, res) {
        const resultado = await responderPostulacion(
                req.params.postulacion_id,
                req.usuario.id,
                req.usuario.rol,
                req.body.estado,
        );
        res.json({ ok: true, data: resultado });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function eliminarPostulacionController(req, res) {
        const resultado = await eliminarPostulacion(
                req.params.postulacion_id,
                req.usuario.id,
        );
        res.json({ ok: true, mensaje: resultado.mensaje });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function eliminarPostulacionRechazadaController(req, res) {
        const resultado = await eliminarPostulacionRechazada(
                req.params.postulacion_id,
                req.usuario.id,
                req.usuario.rol,
        );
        res.json({ ok: true, mensaje: resultado.mensaje });
}

//──────────────────────────────────────────────────────────────────────────────
// INTEGRANTES
//──────────────────────────────────────────────────────────────────────────────

async function listarIntegrantesController(req, res) {
        const integrantes = await obtenerIntegrantes(req.params.id);
        res.json({ ok: true, data: integrantes });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function expulsarController(req, res) {
        const resultado = await expulsarIntegrante(
                req.params.id,
                req.params.usuario_id,
                req.usuario.id,
                req.usuario.rol,
        );
        res.json({ ok: true, mensaje: resultado.mensaje });
}

// ╰─────────────────────────────✧────────────────────────────────╮
async function salirseController(req, res) {
        const resultado = await salirseDeProyecto(req.params.id, req.usuario.id);
        res.json({ ok: true, mensaje: resultado.mensaje });
}

//──────────────────────────────────────────────────────────────────────────────
// FAVORITOS
//──────────────────────────────────────────────────────────────────────────────

async function favoritoController(req, res) {
        const resultado = await toggleFavorito(req.usuario.id, req.params.id);
        res.json({ ok: true, ...resultado });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function listarFavoritosController(req, res) {
        const favoritos = await obtenerFavoritos(req.usuario.id);
        res.json({ ok: true, data: favoritos });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function descartarController(req, res) {
        const resultado = await descartarProyecto(req.usuario.id, req.params.id);
        res.json({ ok: true, mensaje: resultado.mensaje });
}

//──────────────────────────────────────────────────────────────────────────────
// RECOMENDADOS
//──────────────────────────────────────────────────────────────────────────────
async function listarRecomendadosController(req, res) {
        const { pagina, limite } = req.query;

        const resultado = await obtenerProyectosRecomendados(req.usuario.id, {
                pagina: Number(pagina) || 1,
                limite: Number(limite) || 20,
        });

        res.json({
                ok: true,
                datos: resultado.datos,
                total: resultado.total,
                pagina: resultado.pagina,
                total_paginas: resultado.total_paginas,
                tiene_intereses: resultado.tiene_intereses,
        });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function habilidadesDemandaController(req, res) {
        const { limite } = req.query;
        const datos = await obtenerHabilidadesEnDemanda(req.usuario.id, { limite: Number(limite) || 8 });
        res.json({ ok: true, datos });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function usuariosSimilaresController(req, res) {
        const { limite } = req.query;
        const datos = await obtenerUsuariosSimilares(req.usuario.id, { limite: Number(limite) || 6 });
        res.json({ ok: true, datos });
}

export const crear = manejarController(crearController);
export const listar = manejarController(listarController);
export const listarMisProyectos = manejarController(listarMisProyectosController);
export const obtenerUno = manejarController(obtenerUnoController);
export const actualizar = manejarController(actualizarController);
export const eliminar = manejarController(eliminarController);
export const postular = manejarController(postularController);
export const listarPostulaciones = manejarController(listarPostulacionesController);
export const listarPostulacionesUsuario = manejarController(listarPostulacionesUsuarioController);
export const responderPostulacionExport = manejarController(responderPostulacionController);
export const eliminarPostulacionExport = manejarController(eliminarPostulacionController);
export const eliminarPostulacionRechazadaExport = manejarController(eliminarPostulacionRechazadaController);
export const listarIntegrantes = manejarController(listarIntegrantesController);
export const expulsar = manejarController(expulsarController);
export const salirse = manejarController(salirseController);
export const favorito = manejarController(favoritoController);
export const listarFavoritos = manejarController(listarFavoritosController);
export const descartar = manejarController(descartarController);
export const listarRecomendados = manejarController(listarRecomendadosController);
export const habilidadesDemanda = manejarController(habilidadesDemandaController);
export const usuariosSimilares = manejarController(usuariosSimilaresController);