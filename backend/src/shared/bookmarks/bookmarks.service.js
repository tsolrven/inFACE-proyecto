import { Prisma } from '@prisma/client';
import { prisma } from '../../config/configDb.js';
import { BadRequestError } from '../../errors/appError.js';
import {
  verificarContenidoExiste,
  hidratarGuardados,
  buscarEnGuardados,
  tiposContenidoValidos,
} from '../content/contentRegistry.js';
import {
  interpretarBusqueda,
  condicionTexto,
} from '../search/busqueda.helper.js';
import { BUSQUEDA_MIN } from '../search/busqueda.validation.js';
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
// Con búsqueda: se traen TODOS los ids guardados (una persona guarda decenas o
// cientos, no miles), el módulo dueño dice cuáles coinciden y se pagina aquí,
// conservando el orden de guardado.
async function listarIdsGuardadosConBusqueda({
  usuario_id,
  tipo_contenido,
  consulta,
  pagina,
  limite,
}) {
  const registros = await prisma.guardado.findMany({
    where: { usuario_id, tipo_contenido },
    orderBy: { creado_en: 'desc' },
    select: { contenido_id: true },
  });
  const todos = registros.map((r) => r.contenido_id);
  if (todos.length === 0) return { ids: [], total: 0 };

  const coinciden = new Set(
    await buscarEnGuardados(tipo_contenido, consulta, todos),
  );
  const filtrados = todos.filter((id) => coinciden.has(id));

  return {
    ids: filtrados.slice((pagina - 1) * limite, pagina * limite),
    total: filtrados.length,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Comentarios guardados que pertenecen a un tipo de contenido (ej: solo los de hilos).
// Guardado es polimórfico (sin FK a comentarios), así que el filtro es un JOIN a mano.
// Es el único punto donde este servicio conoce la tabla de comentarios.
// Con `texto`, busca en el contenido y excluye los comentarios eliminados.
async function listarIdsGuardadosDeComentarios({
  usuario_id,
  padre,
  texto,
  pagina,
  limite,
}) {
  const offset = (pagina - 1) * limite;
  const filtroBusqueda = texto
    ? Prisma.sql`AND c.eliminado = false
        AND ${condicionTexto(['c.contenido'], texto)}`
    : Prisma.empty;

  const [filas, conteo] = await Promise.all([
    prisma.$queryRaw`
      SELECT g.contenido_id
      FROM guardados g
      JOIN comentarios c ON c.id = g.contenido_id
      WHERE g.usuario_id = ${usuario_id}
        AND g.tipo_contenido = 'comentario'
        AND c.tipo_contenido = ${padre}
        ${filtroBusqueda}
      ORDER BY g.creado_en DESC
      LIMIT ${limite} OFFSET ${offset}`,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM guardados g
      JOIN comentarios c ON c.id = g.contenido_id
      WHERE g.usuario_id = ${usuario_id}
        AND g.tipo_contenido = 'comentario'
        AND c.tipo_contenido = ${padre}
        ${filtroBusqueda}`,
  ]);

  return {
    ids: filas.map((f) => f.contenido_id),
    total: conteo[0]?.total ?? 0,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Un comentario no tiene hashtags: su búsqueda es siempre por texto literal
// ("#calculo" busca ese texto, con el #).
function textoBusquedaComentario(busqueda) {
  const valor = busqueda?.trim() ?? '';
  return valor.length >= BUSQUEDA_MIN ? valor : null;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarGuardados({
  usuario_id,
  tipo_contenido = 'apunte',
  padre,
  busqueda,
  pagina = 1,
  limite = 20,
}) {
  if (!tiposContenidoValidos().includes(tipo_contenido)) {
    throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
  }

  let resultado;
  if (tipo_contenido === 'comentario' && padre) {
    resultado = await listarIdsGuardadosDeComentarios({
      usuario_id,
      padre,
      texto: textoBusquedaComentario(busqueda),
      pagina,
      limite,
    });
  } else {
    const consulta = interpretarBusqueda(busqueda);
    resultado = consulta
      ? await listarIdsGuardadosConBusqueda({
        usuario_id,
        tipo_contenido,
        consulta,
        pagina,
        limite,
      })
      : await listarIdsGuardados({
        usuario_id,
        tipo_contenido,
        pagina,
        limite,
      });
  }

  const { ids, total } = resultado;
  const paginas = Math.ceil(total / limite);

  if (ids.length === 0) {
    return { items: [], total, pagina, paginas };
  }

  const items = await hidratarGuardados(tipo_contenido, ids, usuario_id);
  return { items, total, pagina, paginas };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { guardarContenido, quitarGuardado, listarGuardados };