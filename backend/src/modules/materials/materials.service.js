import { prisma } from '../../config/configDb.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import { MIME_MAP } from './fileType.helper.js';
import {
  borrarArchivosFisicos,
  formatearArchivo,
  datosArchivo,
} from '../../shared/files/files.service.js';
import { eliminarContenido } from '../../shared/content/contentCleanup.js';
import {
  bloquearContenido,
  registrarHidratadorGuardados,
  registrarBuscadorGuardados,
  registrarEliminadorModeracion,
  registrarAlQuitarArchivo,
} from '../../shared/content/contentRegistry.js';
import { obtenerEnriquecimiento } from '../../shared/content/contentEnrichment.js';
import { esStaff } from '../../shared/auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
import {
  INCLUDE_HASHTAGS,
  resolverHashtags,
  filtroPorHashtag,
  nombresDeHashtags,
} from '../../shared/hashtags/hashtags.service.js';
import {
  interpretarBusqueda,
  condicionTexto,
  restringirIds,
  aplicarBusqueda,
} from '../../shared/search/busqueda.helper.js';
import { notificarReportesCerrados } from '../../shared/moderation/reports.notifications.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// host github.com o un subdominio (gist.github.com), sin distinguir mayúsculas;
// anclado para que "github.com.evil.com" o "notgithub.com" no coincidan.
// Debe ser el mismo criterio que esLinkGithub en frontend/.../utils/fileMeta.js
const REGEX_LINK_GITHUB = String.raw`^https?://([^/?#@]*@)?([a-z0-9-]+\.)*github\.com(:[0-9]+)?([/?#]|$)`;

// ids de apuntes que cumplen el filtro por tipo; null = filtro desconocido
async function idsPorTipoArchivo(tipo_archivo) {
  if (MIME_MAP[tipo_archivo]) {
    const archivos = await prisma.archivo.findMany({
      where: {
        tipo_contenido: 'apunte',
        OR: MIME_MAP[tipo_archivo].map((prefix) => ({
          tipo_mime: { startsWith: prefix },
        })),
      },
      select: { contenido_id: true },
      distinct: ['contenido_id'],
    });
    return archivos.map((a) => a.contenido_id);
  }

  if (tipo_archivo === 'snippet') {
    // al menos un carácter que no sea espacio (cubre filas antiguas con '')
    const filas = await prisma.$queryRaw`
      SELECT id FROM "apuntes"
      WHERE codigo_snippet ~ '[^[:space:]]'`;
    return filas.map((f) => f.id);
  }

  if (tipo_archivo === 'github') {
    const filas = await prisma.$queryRaw`
      SELECT id FROM "apuntes"
      WHERE EXISTS (
        SELECT 1 FROM unnest(links) AS l(url)
        WHERE l.url ~* ${REGEX_LINK_GITHUB}
      )`;
    return filas.map((f) => f.id);
  }

  return null;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// ids de apuntes cuyo título, descripción o nombre de algún archivo adjunto
// contiene el texto (sin mayúsculas ni tildes). El snippet y los links no se
// buscan a propósito.
async function idsPorBusquedaTexto(texto) {
  const filas = await prisma.$queryRaw`
    SELECT a.id
    FROM "apuntes" a
    WHERE ${condicionTexto(['a.titulo', 'a.descripcion'], texto)}
    UNION
    SELECT ar.contenido_id AS id
    FROM "archivos" ar
    WHERE ar.tipo_contenido = 'apunte'
      AND ${condicionTexto(['ar.nombre_archivo'], texto)}`;
  return filas.map((f) => f.id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// relaciones que siempre se piden junto con un apunte
const INCLUDE_APUNTE = {
  autor: { select: AUTOR_PUBLICO_SELECT },
  ramo: { select: { id: true, nombre: true, codigo: true, semestre: true } },
  hashtags: INCLUDE_HASHTAGS,
};
// ────────────────────────────────────────────────────────────────────────────────────────
const MENSAJE_SIN_CONTENIDO =
  'El material debe incluir al menos un archivo, un link o un snippet de código';

// Invariante: un material siempre tiene al menos un archivo, un link o un snippet.
function tieneContenido({ cantidadArchivos, links, codigo_snippet }) {
  return (
    cantidadArchivos > 0 || (links?.length ?? 0) > 0 || !!codigo_snippet?.trim()
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Único lugar donde se arma el apunte "completo" para un usuario
// (feed, detalle, guardados y edición pasan todos por acá).
async function formatearApuntes(apuntes, usuario_id) {
  const ids = apuntes.map((a) => a.id);
  const { mapVotos, setGuardados, mapComentarios, mapArchivos } =
    await obtenerEnriquecimiento('apunte', ids, usuario_id);

  return apuntes.map((a) =>
    formatearApunte(a, {
      comentarios: mapComentarios.get(a.id) ?? 0,
      archivos: mapArchivos.get(a.id) ?? [],
      mi_voto: mapVotos.get(a.id) ?? null,
      esta_guardado: setGuardados.has(a.id),
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarApuntes({
  ramo_id,
  tipo,
  tipo_archivo,
  hashtag,
  busqueda,
  orden = 'recientes',
  pagina = 1,
  limite = 20,
  usuario_id,
  carrera_id,
}) {
  if (!carrera_id) {
    return { apuntes: [], total: 0, pagina, paginas: 0 };
  }

  const where = {
    ramo: { ramo_carrera: { some: { carrera_id } } },
  };
  if (ramo_id) where.ramo_id = ramo_id;
  if (tipo) where.tipo = tipo;
  if (hashtag) {
    where.hashtags = filtroPorHashtag(hashtag);
  }

  if (tipo_archivo) {
    const idsConEseTipo = await idsPorTipoArchivo(tipo_archivo);
    if (idsConEseTipo !== null) {
      if (idsConEseTipo.length === 0) {
        return { apuntes: [], total: 0, pagina, paginas: 0 };
      }
      restringirIds(where, idsConEseTipo);
    }
  }

  // barra de búsqueda: "#prefijo" busca por hashtag; si no, por texto.
  // En AND: no pisa el filtro ?hashtag= ni el de tipo_archivo.
  const hayResultados = await aplicarBusqueda(
    where,
    interpretarBusqueda(busqueda),
    idsPorBusquedaTexto,
  );
  if (!hayResultados) {
    return { apuntes: [], total: 0, pagina, paginas: 0 };
  }

  // `id` como último criterio: garantiza un orden total y estable entre páginas
  const orderBy =
    orden === 'populares'
      ? [{ votos_neto: 'desc' }, { creado_en: 'desc' }, { id: 'desc' }]
      : [{ creado_en: 'desc' }, { id: 'desc' }];

  const [apuntes, total] = await Promise.all([
    prisma.apunte.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: INCLUDE_APUNTE,
    }),
    prisma.apunte.count({ where }),
  ]);

  return {
    apuntes: await formatearApuntes(apuntes, usuario_id),
    total,
    pagina,
    paginas: Math.ceil(total / limite),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerApunte(id, usuario_id) {
  const apunte = await prisma.apunte.findUnique({
    where: { id },
    include: INCLUDE_APUNTE,
  });
  if (!apunte) throw new NotFoundError('Apunte');

  const [formateado] = await formatearApuntes([apunte], usuario_id);
  return formateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearApunte({
  autor_id,
  carrera_id,
  ramo_id,
  titulo,
  descripcion,
  tipo,
  links = [],
  codigo_snippet,
  lenguaje_snippet,
  hashtags = [],
  archivos = [],
}) {
  if (
    !tieneContenido({
      cantidadArchivos: archivos.length,
      links,
      codigo_snippet,
    })
  ) {
    throw new BadRequestError(MENSAJE_SIN_CONTENIDO);
  }

  const ramo = await prisma.ramo.findUnique({
    where: { id: ramo_id },
    include: { ramo_carrera: { select: { carrera_id: true } } },
  });
  if (!ramo) throw new NotFoundError('Ramo');

  const ramoEsDeSuCarrera = ramo.ramo_carrera.some(
    (rc) => rc.carrera_id === carrera_id,
  );
  if (!ramoEsDeSuCarrera) {
    throw new ForbiddenError('No puedes publicar en un ramo de otra carrera');
  }

  // todo lo que puede fallar por datos inválidos, antes de abrir la transacción
  const hashtagsCreate = await resolverHashtags(hashtags);
  const datosArchivos = archivos.map(datosArchivo);

  const { apunte, archivosCreados } = await prisma.$transaction(async (tx) => {
    const apunte = await tx.apunte.create({
      data: {
        autor_id,
        ramo_id,
        titulo,
        descripcion,
        tipo: tipo || 'apunte',
        links,
        codigo_snippet,
        lenguaje_snippet: codigo_snippet ? lenguaje_snippet : null,
        hashtags: { create: hashtagsCreate },
      },
      include: INCLUDE_APUNTE,
    });

    const archivosCreados = [];
    for (const data of datosArchivos) {
      archivosCreados.push(
        await tx.archivo.create({
          data: { tipo_contenido: 'apunte', contenido_id: apunte.id, ...data },
        }),
      );
    }
    return { apunte, archivosCreados };
  });

  return formatearApunte(apunte, { archivos: archivosCreados });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarApunte(id, usuario_id, datos) {
  const apunte = await prisma.apunte.findUnique({ where: { id } });
  if (!apunte) throw new NotFoundError('Apunte');

  if (apunte.autor_id !== usuario_id) {
    throw new ForbiddenError('Solo el autor puede editar este apunte');
  }
  const {
    ramo_id,
    titulo,
    descripcion,
    tipo,
    links,
    codigo_snippet,
    lenguaje_snippet,
    hashtags,
  } = datos;

  if (ramo_id && ramo_id !== apunte.ramo_id) {
    const [ramoActual, ramoNuevo] = await Promise.all([
      prisma.ramo.findUnique({
        where: { id: apunte.ramo_id },
        include: { ramo_carrera: { select: { carrera_id: true } } },
      }),
      prisma.ramo.findUnique({
        where: { id: ramo_id },
        include: { ramo_carrera: { select: { carrera_id: true } } },
      }),
    ]);
    if (!ramoNuevo) throw new NotFoundError('Ramo');

    const carrerasActuales = new Set(
      ramoActual.ramo_carrera.map((rc) => rc.carrera_id),
    );
    const compartenCarrera = ramoNuevo.ramo_carrera.some((rc) =>
      carrerasActuales.has(rc.carrera_id),
    );
    if (!compartenCarrera) {
      throw new ForbiddenError(
        'No puedes mover este material a un ramo de otra carrera',
      );
    }
  }

  // lo que puede fallar por datos inválidos, antes de abrir la transacción
  const hashtagsCreate = hashtags ? await resolverHashtags(hashtags) : null;

  const apunteActualizado = await prisma.$transaction(async (tx) => {
    // bloquea el apunte: serializa contra DELETE /archivos/:id y otros PATCH
    await bloquearContenido('apunte', id, tx);

    // el invariante solo se revisa si este PATCH toca links o snippet; se lee
    // el estado vigente porque pudo cambiar entre la primera lectura y el bloqueo
    if (links !== undefined || codigo_snippet !== undefined) {
      const vigente = await tx.apunte.findUnique({
        where: { id },
        select: { links: true, codigo_snippet: true },
      });
      const cantidadArchivos = await tx.archivo.count({
        where: { tipo_contenido: 'apunte', contenido_id: id },
      });
      const final = {
        cantidadArchivos,
        links: links !== undefined ? links : vigente.links,
        codigo_snippet:
          codigo_snippet !== undefined
            ? codigo_snippet
            : vigente.codigo_snippet,
      };
      if (!tieneContenido(final)) {
        throw new BadRequestError(MENSAJE_SIN_CONTENIDO);
      }
    }

    return tx.apunte.update({
      where: { id },
      data: {
        editado_en: new Date(),
        ...(ramo_id && { ramo_id }),
        ...(titulo && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(tipo && { tipo }),
        ...(links !== undefined && { links }),
        ...(codigo_snippet !== undefined && {
          codigo_snippet,
          lenguaje_snippet: codigo_snippet ? lenguaje_snippet : null,
        }),
        ...(hashtags && {
          hashtags: { deleteMany: {}, create: hashtagsCreate },
        }),
      },
      include: INCLUDE_APUNTE,
    });
  });

  const [apunteFormateado] = await formatearApuntes(
    [apunteActualizado],
    usuario_id,
  );
  return apunteFormateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarApunte(id, usuario_id, rol, { respuesta = null } = {}) {
  const apunte = await prisma.apunte.findUnique({ where: { id } });
  if (!apunte) throw new NotFoundError('Apunte');

  if (apunte.autor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar este apunte');
  }

  const { archivos, reportes_a_notificar } = await prisma.$transaction(
    async (tx) => {
      const resultado = await eliminarContenido(tx, 'apunte', id, {
        por_moderacion: esStaff(rol),
        revisor_id: usuario_id,
        respuesta,
      });
      await tx.apunte.delete({ where: { id } });
      return resultado;
    },
  );

  // después del commit: ni el correo ni el disco pueden revertir el borrado
  notificarReportesCerrados(reportes_a_notificar);
  await borrarArchivosFisicos(archivos);

  logger.info('Apunte eliminado', { apunte_id: id, eliminado_por: usuario_id });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarApuntesGuardados(ids, usuario_id) {
  const apuntes = await prisma.apunte.findMany({
    where: { id: { in: ids } },
    include: INCLUDE_APUNTE,
  });

  // se respeta el orden de `ids` (el guardado más reciente primero) y se omiten
  // los apuntes que ya no existen
  const mapApuntes = new Map(apuntes.map((a) => [a.id, a]));
  const ordenados = ids.map((id) => mapApuntes.get(id)).filter(Boolean);

  return formatearApuntes(ordenados, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
function formatearApunte(
  apunte,
  {
    comentarios = 0,
    archivos = [],
    mi_voto = null,
    esta_guardado = false,
  } = {},
) {
  return {
    id: apunte.id,
    tipo_contenido: 'apunte',
    titulo: apunte.titulo,
    descripcion: apunte.descripcion,
    tipo: apunte.tipo,
    votos_neto: apunte.votos_neto,
    mi_voto,
    esta_guardado,
    links: apunte.links ?? [],
    codigo_snippet: apunte.codigo_snippet,
    lenguaje_snippet: apunte.lenguaje_snippet,
    creado_en: apunte.creado_en,
    editado_en: apunte.editado_en,
    autor: {
      id: apunte.autor.id,
      nombre_usuario: apunte.autor.perfil?.nombre_usuario,
    },
    ramo: {
      id: apunte.ramo.id,
      nombre: apunte.ramo.nombre,
      codigo: apunte.ramo.codigo,
      semestre: apunte.ramo.semestre,
    },
    hashtags: nombresDeHashtags(apunte.hashtags),
    archivos: archivos.map(formatearArchivo),
    comentarios_count: comentarios,
    descargas: archivos.reduce(
      (acc, a) => acc + (a.contador_descargas ?? 0),
      0,
    ),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
registrarHidratadorGuardados('apunte', hidratarApuntesGuardados);
// ────────────────────────────────────────────────────────────────────────────────────────
// Búsqueda en la pestaña Guardados: mismas reglas que el listado
registrarBuscadorGuardados('apunte', async (consulta, ids) => {
  const where = { id: { in: ids } };
  if (!(await aplicarBusqueda(where, consulta, idsPorBusquedaTexto))) return [];
  const filas = await prisma.apunte.findMany({ where, select: { id: true } });
  return filas.map((f) => f.id);
});
// ────────────────────────────────────────────────────────────────────────────────────────
// Quitar un archivo no puede dejar el material vacío. Corre dentro de la
// transacción de eliminarArchivo, con el apunte ya bloqueado.
registrarAlQuitarArchivo('apunte', async (tx, archivo) => {
  const apunte = await tx.apunte.findUnique({
    where: { id: archivo.contenido_id },
    select: { links: true, codigo_snippet: true },
  });
  const otrosArchivos = await tx.archivo.count({
    where: {
      tipo_contenido: 'apunte',
      contenido_id: archivo.contenido_id,
      id: { not: archivo.id },
    },
  });
  if (!tieneContenido({ cantidadArchivos: otrosArchivos, ...apunte })) {
    throw new BadRequestError(
      'No puedes quitar el único contenido del material: agrega antes un link, un snippet u otro archivo',
    );
  }
});
// ────────────────────────────────────────────────────────────────────────────────────────
// la pantalla de reportes elimina por moderación a través del registry
registrarEliminadorModeracion('apunte', (id, usuario, respuesta) =>
  eliminarApunte(id, usuario.id, usuario.rol, { respuesta }),
);
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarApuntes,
  obtenerApunte,
  crearApunte,
  actualizarApunte,
  eliminarApunte,
  formatearApunte,
};