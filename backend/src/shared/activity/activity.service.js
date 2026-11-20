import { prisma } from '../../config/configDb.js';
import { NotFoundError } from '../../errors/appError.js';
import {
  obtenerEntradaRegistro,
  filtrarGuardados,
  hidratarGuardados,
} from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// Actividad del perfil (RF-T-12): lo que una persona publicó o comentó en un
// módulo. Reutiliza lo de Guardados: el módulo dueño filtra por carrera
// (filtrarGuardados) y convierte los ids en elementos para las tarjetas
// (hidratarGuardados). Solo cambia de dónde salen los ids.
//
// Cada fila: { id, publicacion_id }. En publicaciones son iguales; en
// comentarios, publicacion_id es la publicación donde está el comentario
// (la carrera de un comentario es la de su publicación).
async function idsDelAutor({ usuario_id, tipo, lista }) {
  if (lista === 'publicaciones') {
    const { modelName, ownerField } = obtenerEntradaRegistro(tipo);
    const filas = await prisma[modelName].findMany({
      where: { [ownerField]: usuario_id },
      orderBy: { creado_en: 'desc' },
      select: { id: true },
    });
    return filas.map((f) => ({ id: f.id, publicacion_id: f.id }));
  }

  // comentarios y respuestas en publicaciones de este módulo; sin eliminados
  const filas = await prisma.comentario.findMany({
    where: { autor_id: usuario_id, tipo_contenido: tipo, eliminado: false },
    orderBy: { creado_en: 'desc' },
    select: { id: true, contenido_id: true },
  });
  return filas.map((f) => ({ id: f.id, publicacion_id: f.contenido_id }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Se traen todos los ids del autor (una persona publica y comenta decenas o
// cientos, no miles), se filtran por carrera y se pagina aquí, como en Guardados.
async function listarActividad({
  usuario_id,
  tipo,
  lista,
  carrera_id,
  viewer_id,
  pagina = 1,
  limite = 20,
}) {
  const existe = await prisma.usuario.findUnique({
    where: { id: usuario_id },
    select: { id: true },
  });
  if (!existe) throw new NotFoundError('Usuario');

  let filas = await idsDelAutor({ usuario_id, tipo, lista });

  if (carrera_id && filas.length > 0) {
    const publicaciones = [...new Set(filas.map((f) => f.publicacion_id))];
    const deLaCarrera = new Set(
      await filtrarGuardados(tipo, publicaciones, { consulta: null, carrera_id }),
    );
    filas = filas.filter((f) => deLaCarrera.has(f.publicacion_id));
  }

  const total = filas.length;
  const pagina_filas = filas.slice((pagina - 1) * limite, pagina * limite);
  const ids = pagina_filas.map((f) => f.id);
  if (ids.length === 0) return { items: [], total };

  // `viewer_id`: quien mira el perfil (su voto y su guardado en cada tarjeta)
  const items = await hidratarGuardados(
    lista === 'publicaciones' ? tipo : 'comentario',
    ids,
    viewer_id,
  );

  return { items, total };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { listarActividad };