import { obtenerEtiquetas } from './etiqueta.service.js';
import { manejarController } from '../project-match/matchingProyecto.helper.js';

async function listarController(req, res) {
  const { q } = req.query;
  const etiquetas = await obtenerEtiquetas({ q });
  res.json({ ok: true, data: etiquetas });
}

export const listar = manejarController(listarController);
