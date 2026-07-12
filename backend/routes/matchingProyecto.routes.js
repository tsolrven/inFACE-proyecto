import express from 'express';
import {
    crear,
    listar,
    obtenerUno,
    actualizar,
    eliminar,
    postular,
    listarMisProyectos,
    listarPostulaciones,
    listarPostulacionesUsuario,
    responderPostulacionExport,
    eliminarPostulacionExport,
    eliminarPostulacionRechazadaExport,
    listarIntegrantes,
    expulsar,
    salirse,
    favorito,
    listarFavoritos,
    listarRecomendados,
    descartar,
    habilidadesDemanda,
    usuariosSimilares
} from '../controllers/matchingProyecto.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { verificarCreador } from '../middlewares/matchingProyecto.middleware.js';

const router = express.Router();

//──────────────────────────────────────────────────────────────────────────────
// PROYECTOS
//──────────────────────────────────────────────────────────────────────────────
// *se deja listar favoritos al final para evitar confusiones con el endpoint de obtener un proyecto por id (GET /api/proyecto/:id)
router.get('/favoritos', autenticar, listarFavoritos); // GET  /api/proyecto/favoritos
router.get('/postulaciones/usuario', autenticar, listarPostulacionesUsuario);
router.get('/mios', autenticar, listarMisProyectos);
router.get('/recomendados', autenticar, listarRecomendados); // GET  /api/proyecto/recomendados (matching por etiquetas)
router.get('/habilidades-demanda', autenticar, habilidadesDemanda); // GET  /api/proyecto/habilidades-demanda
router.get('/usuarios-similares', autenticar, usuariosSimilares); // GET  /api/proyecto/usuarios-similares
router.post('/:id/descartar', autenticar, descartar); // POST /api/proyecto/:id/descartar

router.get('/', autenticar, listar); // GET  /api/proyecto
router.post('/', autenticar, crear); // POST /api/proyecto

router.get('/:id', autenticar, obtenerUno); // GET  /api/proyecto/:id

router.put('/:id', autenticar, verificarCreador, actualizar); // PUT  /api/proyecto/:id
router.delete('/:id', autenticar, verificarCreador, eliminar); // DEL  /api/proyecto/:id

//──────────────────────────────────────────────────────────────────────────────
// POSTULACIONES
//──────────────────────────────────────────────────────────────────────────────

router.post('/:id/postular', autenticar, postular); // POST /api/proyecto/:id/postular
router.get('/:id/postulaciones', autenticar, listarPostulaciones); // GET  /api/proyecto/:id/postulaciones
router.patch('/:id/postulaciones/:postulacion_id', autenticar, responderPostulacionExport); // PATCH /api/proyecto/:id/postulaciones/:postulacion_id
router.delete('/:id/postulaciones/:postulacion_id', autenticar, eliminarPostulacionExport);                 // DELETE /api/proyecto/:id/postulaciones/:postulacion_id  (postulante retira la suya)
router.delete('/:id/postulaciones/:postulacion_id/rechazada', autenticar, verificarCreador, eliminarPostulacionRechazadaExport); // DELETE /api/proyecto/:id/postulaciones/:postulacion_id/rechazada (creador limpia rechazadas)


//──────────────────────────────────────────────────────────────────────────────
// INTEGRANTES
//──────────────────────────────────────────────────────────────────────────────

router.get('/:id/integrantes', autenticar, listarIntegrantes); // GET  /api/proyecto/:id/integrantes
router.delete('/:id/integrantes/:usuario_id', autenticar, verificarCreador, expulsar); // DEL  /api/proyecto/:id/integrantes/:usuario_id
router.delete('/:id/salir', autenticar, salirse); // DELETE /api/proyecto/:id/salir 

//──────────────────────────────────────────────────────────────────────────────
// FAVORITOS
//──────────────────────────────────────────────────────────────────────────────

router.post('/:id/favorito', autenticar, favorito); // POST /api/proyecto/:id/favorito

export default router;