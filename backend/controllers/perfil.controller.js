import {
    obtenerPerfilPropio,
    obtenerPerfilPublico,
    actualizarPerfil,
    actualizarMisEtiquetas,
} from '../services/perfil.service.js';
import { manejarController } from '../helpers/matchingProyecto.helper.js';

async function obtenerMiPerfilController(req, res) {
    const perfil = await obtenerPerfilPropio(req.usuario.id);
    res.json({ ok: true, data: perfil });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function obtenerPerfilPublicoController(req, res) {
    const perfil = await obtenerPerfilPublico(req.params.nombre_usuario);
    res.json({ ok: true, data: perfil });
}

// ╰─────────────────────────────✧────────────────────────────────


async function actualizarMiPerfilController(req, res) {
    const perfil = await actualizarPerfil(req.usuario.id, req.body);
    res.json({ ok: true, data: perfil });
}

// ╰─────────────────────────────✧────────────────────────────────╮

async function actualizarMisEtiquetasController(req, res) {
    const perfil = await actualizarMisEtiquetas(req.usuario.id, req.body.etiqueta_ids);
    res.json({ ok: true, data: perfil });
}

export const obtenerMiPerfil = manejarController(obtenerMiPerfilController);
export const obtenerPerfilPublicoExport = manejarController(obtenerPerfilPublicoController);
export const actualizarMiPerfil = manejarController(actualizarMiPerfilController);
export const actualizarMisEtiquetasExport = manejarController(actualizarMisEtiquetasController);