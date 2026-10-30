import { prisma } from '../../config/configDb.js';
import { BadRequestError } from '../../errors/appError.js';
import {
  verificarContenidoExiste,
  hidratarGuardados,
  tiposContenidoValidos,
} from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function guardarContenido({ usuario_id, tipo_contenido, contenido_id }) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);
  await prisma.guardado.createMany({
    data: [{ usuario_id, tipo_contenido, contenido_id }],
    skipDuplicates: true,
  });
  return { guardado: true };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// No exige que el contenido siga disponible: siempre se puede dejar de guardar.
async function quitarGuardado({ usuario_id, tipo_contenido, contenido_id }) {
  await prisma.guardado.deleteMany({
    where: { usuario_id, tipo_contenido, contenido_id },
  });
  return { guardado: false };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Ids guardados de un tipo, del más reciente al más antiguo.
async function listarIdsGuardados({
  usuario_id,
  tipo_contenido,
  pagina,
  limite,
}) {
  const [registros, total] = await Promise.all([
    prisma.guardado.findMany({
      where: { usuario_id, tipo_contenido },
      orderBy: { creado_en: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.guardado.count({ where: { usuario_id, tipo_contenido } }),
  ]);
  return { ids: registros.map((r) => r.contenido_id), total };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Comentarios guardados que pertenecen a un tipo de contenido (ej: solo los de hilos).
// Guardado es polimórfico (sin FK a comentarios), así que el filtro es un JOIN a mano.
// Es el único punto donde este servicio conoce la tabla de comentarios.
async function listarIdsGuardadosDeComentarios({
  usuario_id,
  padre,
  pagina,
  limite,
}) {
  const offset = (pagina - 1) * limite;

  const [filas, conteo] = await Promise.all([
    prisma.$queryRaw`
      SELECT g.contenido_id
      FROM guardados g
      JOIN comentarios c ON c.id = g.contenido_id
      WHERE g.usuario_id = ${usuario_id}
        AND g.tipo_contenido = 'comentario'
        AND c.tipo_contenido = ${padre}
      ORDER BY g.creado_en DESC
      LIMIT ${limite} OFFSET ${offset}`,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM guardados g
      JOIN comentarios c ON c.id = g.contenido_id
      WHERE g.usuario_id = ${usuario_id}
        AND g.tipo_contenido = 'comentario'
        AND c.tipo_contenido = ${padre}`,
  ]);

  return {
    ids: filas.map((f) => f.contenido_id),
    total: conteo[0]?.total ?? 0,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarGuardados({
  usuario_id,
  tipo_contenido = 'apunte',
  padre,
  pagina = 1,
  limite = 20,
}) {
  if (!tiposContenidoValidos().includes(tipo_contenido)) {
    throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
  }

  const { ids, total } =
    tipo_contenido === 'comentario' && padre
      ? await listarIdsGuardadosDeComentarios({
          usuario_id,
          padre,
          pagina,
          limite,
        })
      : await listarIdsGuardados({
          usuario_id,
          tipo_contenido,
          pagina,
          limite,
        });

  const paginas = Math.ceil(total / limite);

  if (ids.length === 0) {
    return { items: [], total, pagina, paginas };
  }

  const items = await hidratarGuardados(tipo_contenido, ids, usuario_id);
  return { items, total, pagina, paginas };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { guardarContenido, quitarGuardado, listarGuardados };
