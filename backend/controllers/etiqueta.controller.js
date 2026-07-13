import { obtenerEtiquetas } from '../services/etiqueta.service.js';
import { manejarController } from '../helpers/matchingProyecto.helper.js';

async function listarController(req, res) {
    const { q } = req.query;
    const etiquetas = await obtenerEtiquetas({ q });
    res.json({ ok: true, data: etiquetas });
}

export const listar = manejarController(listarController);