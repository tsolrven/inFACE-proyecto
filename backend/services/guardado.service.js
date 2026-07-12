import { prisma } from '../config/configDb.js';
import { BadRequestError, NotFoundError } from '../errors/appError.js';
import { formatearApunte } from './apunte.service.js';
import { formatearComentario } from './comentario.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
async function verificarContenidoExiste(tipo_contenido, contenido_id) {
  if (tipo_contenido === 'apunte') {
    const existe = await prisma.apunte.findUnique({
      where: { id: contenido_id },
      select: { id: true },
    });
    if (!existe) throw new NotFoundError('Apunte');
  } else if (tipo_contenido === 'comentario') {
    const existe = await prisma.comentario.findUnique({
      where: { id: contenido_id },
      select: { id: true },
    });
    if (!existe) throw new NotFoundError('Comentario');
  } else {
    throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function alternarGuardado({ usuario_id, tipo_contenido, contenido_id }) {
  await verificarContenidoExiste(tipo_contenido, contenido_id);

  const existente = await prisma.guardado.findUnique({
    where: {
      usuario_id_tipo_contenido_contenido_id: {
        usuario_id,
        tipo_contenido,
        contenido_id,
      },
    },
  });

  if (existente) {
    await prisma.guardado.delete({
      where: {
        usuario_id_tipo_contenido_contenido_id: {
          usuario_id,
          tipo_contenido,
          contenido_id,
        },
      },
    });
    return { guardado: false };
  }

  await prisma.guardado.create({
    data: { usuario_id, tipo_contenido, contenido_id },
  });
  return { guardado: true };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarGuardados({
  usuario_id,
  tipo_contenido = 'apunte',
  pagina = 1,
  limite = 20,
}) {
  if (!['apunte', 'comentario'].includes(tipo_contenido)) {
    throw new BadRequestError(
      `Tipo de contenido "${tipo_contenido}" inválido`,
    );
  }

  const [registros, total] = await Promise.all([
    prisma.guardado.findMany({
      where: { usuario_id, tipo_contenido },
      orderBy: { creado_en: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.guardado.count({ where: { usuario_id, tipo_contenido } }),
  ]);

  const ids = registros.map((r) => r.contenido_id);
  const paginas = Math.ceil(total / limite);

  if (ids.length === 0) {
    return { items: [], total, pagina, paginas };
  }

  if (tipo_contenido === 'apunte') {
    const items = await formatearApuntesGuardados(ids, usuario_id);
    return { items, total, pagina, paginas };
  }

  const items = await formatearComentariosGuardados(ids, usuario_id);
  return { items, total, pagina, paginas };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function formatearApuntesGuardados(ids, usuario_id) {
  const [apuntes, conteoComentarios, archivos, misVotos] = await Promise.all([
    prisma.apunte.findMany({
      where: { id: { in: ids } },
      include: {
        autor: { include: { perfil: { select: { nombre_usuario: true } } } },
        ramo: {
          select: { id: true, nombre: true, codigo: true, semestre: true },
        },
        hashtags: { include: { hashtag: { select: { nombre: true } } } },
      },
    }),
    prisma.comentario.groupBy({
      by: ['contenido_id'],
      where: { tipo_contenido: 'apunte', contenido_id: { in: ids } },
      _count: { _all: true },
    }),
    prisma.archivo.findMany({
      where: { tipo_contenido: 'apunte', contenido_id: { in: ids } },
    }),
    prisma.voto.findMany({
      where: { usuario_id, tipo_contenido: 'apunte', contenido_id: { in: ids } },
    }),
  ]);

  const mapApuntes = Object.fromEntries(apuntes.map((a) => [a.id, a]));
  const mapComentarios = Object.fromEntries(
    conteoComentarios.map((c) => [c.contenido_id, c._count._all]),
  );
  const mapArchivos = {};
  for (const arch of archivos) {
    if (!mapArchivos[arch.contenido_id]) mapArchivos[arch.contenido_id] = [];
    mapArchivos[arch.contenido_id].push(arch);
  }
  const mapVotos = Object.fromEntries(
    misVotos.map((v) => [v.contenido_id, v.tipo]),
  );

  // se recorre `ids` (no `apuntes`) para preservar el orden de guardado más
  // reciente primero; si el apunte fue borrado el guardado queda huérfano y
  // simplemente se omite
  return ids
    .filter((id) => mapApuntes[id])
    .map((id) =>
      formatearApunte(mapApuntes[id], {
        comentarios: mapComentarios[id] || 0,
        archivos: mapArchivos[id] || [],
        mi_voto: mapVotos[id] || null,
        esta_guardado: true,
      }),
    );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function formatearComentariosGuardados(ids, usuario_id) {
  const comentarios = await prisma.comentario.findMany({
    where: { id: { in: ids } },
    include: {
      autor: { include: { perfil: { select: { nombre_usuario: true } } } },
    },
  });

  const mapComentarios = Object.fromEntries(comentarios.map((c) => [c.id, c]));
  const misVotos = await prisma.voto.findMany({
    where: {
      usuario_id,
      tipo_contenido: 'comentario',
      contenido_id: { in: ids },
    },
  });
  const mapVotos = Object.fromEntries(
    misVotos.map((v) => [v.contenido_id, v.tipo]),
  );

  // los comentarios guardados siempre pertenecen a un apunte: se trae esa
  // referencia liviana para poder enlazar de vuelta al post desde la vista
  // de guardados
  const apunteIds = [...new Set(comentarios.map((c) => c.contenido_id))];
  const apuntesRelacionados = await prisma.apunte.findMany({
    where: { id: { in: apunteIds } },
    select: { id: true, titulo: true },
  });
  const mapApuntesRelacionados = Object.fromEntries(
    apuntesRelacionados.map((a) => [a.id, a]),
  );

  return ids
    .filter((id) => mapComentarios[id])
    .map((id) => {
      const comentario = mapComentarios[id];
      return {
        ...formatearComentario(comentario, {
          mi_voto: mapVotos[id] || null,
          esta_guardado: true,
        }),
        apunte: mapApuntesRelacionados[comentario.contenido_id] || null,
      };
    });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { alternarGuardado, listarGuardados };
