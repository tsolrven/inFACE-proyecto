import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import {
  borrarArchivosFisicos,
  formatearArchivo,
  datosArchivo,
} from '../../shared/files/files.service.js';
import { eliminarContenido } from '../../shared/content/contentCleanup.js';
import {
  registrarHidratadorGuardados,
  registrarPermisoAdjuntos,
  bloquearContenido,
  registrarEliminadorModeracion,
} from '../../shared/content/contentRegistry.js';
import { obtenerEnriquecimiento } from '../../shared/content/contentEnrichment.js';
import {
  esStaff,
  puedePublicarAnuncioEn,
} from '../../shared/auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
import {
  hoyEnChile,
  filtroCargoVigente,
  TIPOS_CARGO,
} from '../../shared/auth/cargos.js';
import { recortar } from '../../shared/content/extracto.js';
import {
  INCLUDE_HASHTAGS,
  resolverHashtags,
  filtroPorHashtag,
  nombresDeHashtags,
} from '../../shared/hashtags/hashtags.service.js';
import { notificarReportesCerrados } from '../../shared/moderation/reports.notifications.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// En las listas el contenido viaja recortado; el detalle lo trae completo.
const EXTRACTO_MAX = 300;

// La insignia del autor (CEE, Tutor) se calcula en formatearAnuncios.
const INCLUDE_ANUNCIO = {
  autor: { select: AUTOR_PUBLICO_SELECT },
  carrera: { select: { id: true, nombre: true, codigo: true } },
  flair: { select: { id: true, nombre: true, color: true } },
  hashtags: INCLUDE_HASHTAGS,
};
// ────────────────────────────────────────────────────────────────────────────────────────
// Único lugar donde se arma el anuncio para un usuario (lista, detalle, guardados, edición).
async function formatearAnuncios(
  anuncios,
  usuario_id,
  { extracto = false } = {},
) {
  const ids = anuncios.map((a) => a.id);
  const { mapVotos, setGuardados, mapComentarios, mapArchivos } =
    await obtenerEnriquecimiento('anuncio', ids, usuario_id);

  // cargo vigente de cada autor en la carrera de su anuncio (insignia)
  const autorIds = [...new Set(anuncios.map((a) => a.autor.id))];
  const cargosVigentes = autorIds.length
    ? await prisma.asignacionRol.findMany({
      where: {
        usuario_id: { in: autorIds },
        ...filtroCargoVigente(hoyEnChile()),
      },
      select: { usuario_id: true, carrera_id: true, tipo: true },
    })
    : [];
  const cargoDe = (a) => {
    const propios = cargosVigentes.filter(
      (c) => c.usuario_id === a.autor.id && c.carrera_id === a.carrera.id,
    );
    return (
      propios.find((c) => c.tipo === TIPOS_CARGO.CEE)?.tipo ??
      propios[0]?.tipo ??
      null
    );
  };

  return anuncios.map((a) =>
    formatearAnuncio(a, {
      extracto,
      comentarios: mapComentarios.get(a.id) ?? 0,
      cargo: cargoDe(a),
      archivos: mapArchivos.get(a.id) ?? [],
      mi_voto: mapVotos.get(a.id) ?? null,
      esta_guardado: setGuardados.has(a.id),
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cualquier usuario con sesión ve los anuncios de cualquier carrera; por defecto
// el controlador pasa la suya.
async function listarAnuncios({
  carrera_id,
  flair_id,
  hashtag,
  orden = 'recientes',
  pagina = 1,
  limite = 20,
  usuario_id,
}) {
  if (!carrera_id) {
    return { anuncios: [], total: 0, pagina, paginas: 0 };
  }

  const where = { carrera_id };
  if (flair_id) where.flair_id = flair_id;
  if (hashtag) where.hashtags = filtroPorHashtag(hashtag);

  // `id` como último criterio: orden total y estable entre páginas
  const orderBy =
    orden === 'populares'
      ? [{ votos_neto: 'desc' }, { creado_en: 'desc' }, { id: 'desc' }]
      : [{ creado_en: 'desc' }, { id: 'desc' }];

  const [anuncios, total] = await Promise.all([
    prisma.anuncio.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: INCLUDE_ANUNCIO,
    }),
    prisma.anuncio.count({ where }),
  ]);

  return {
    anuncios: await formatearAnuncios(anuncios, usuario_id, { extracto: true }),
    total,
    pagina,
    paginas: Math.ceil(total / limite),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerAnuncio(id, usuario_id) {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id },
    include: INCLUDE_ANUNCIO,
  });
  if (!anuncio) throw new NotFoundError('Anuncio');

  const [formateado] = await formatearAnuncios([anuncio], usuario_id);
  return formateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Un flair solo se puede usar en anuncios de su misma carrera.
async function exigirFlairDeLaCarrera(flair_id, carrera_id) {
  const flair = await prisma.flair.findUnique({
    where: { id: flair_id },
    select: { carrera_id: true },
  });
  if (!flair) throw new NotFoundError('Flair');
  if (flair.carrera_id !== carrera_id) {
    throw new BadRequestError('El flair no pertenece a la carrera del anuncio');
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Editar: solo el autor, mientras siga pudiendo publicar en la carrera del
// anuncio (si le quitan el rol, pierde el control). El superadmin no edita.
function puedeEditarAnuncio(usuario, anuncio) {
  return (
    anuncio.autor_id === usuario.id &&
    puedePublicarAnuncioEn(usuario, anuncio.carrera_id)
  );
}

// Eliminar: el superadmin (moderación) o quien puede editar.
function puedeEliminarAnuncio(usuario, anuncio) {
  return esStaff(usuario.rol) || puedeEditarAnuncio(usuario, anuncio);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Archivos del anuncio (los consulta files.service): subir y eliminar archivos
// sueltos es editar, así que solo el autor con permiso. El superadmin elimina
// la publicación entera, y con ella sus archivos.
registrarPermisoAdjuntos('anuncio', async (usuario, anuncio_id) => {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncio_id },
    select: { autor_id: true, carrera_id: true },
  });
  if (!anuncio) throw new NotFoundError('Anuncio');

  return puedeEditarAnuncio(usuario, anuncio);
});

// la pantalla de reportes elimina por moderación a través del registry
registrarEliminadorModeracion('anuncio', (id, usuario, respuesta) =>
  eliminarAnuncio(id, usuario, { respuesta }),
);
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearAnuncio({
  usuario,
  titulo,
  contenido,
  flair_id,
  hashtags = [],
  archivos = [],
}) {
  // la carrera es siempre la del usuario: no viaja en el body
  const destino = usuario.carrera_id;
  if (!destino) throw new BadRequestError('No tienes una carrera asignada');
  if (!puedePublicarAnuncioEn(usuario, destino)) {
    throw new ForbiddenError(
      'No tienes permiso para publicar anuncios en esta carrera',
    );
  }

  const carrera = await prisma.carrera.findUnique({
    where: { id: destino },
    select: { id: true },
  });
  if (!carrera) throw new NotFoundError('Carrera');
  if (flair_id) await exigirFlairDeLaCarrera(flair_id, destino);

  // todo lo que puede fallar por datos inválidos, antes de abrir la transacción
  const hashtagsCreate = await resolverHashtags(hashtags);
  const datosArchivos = archivos.map(datosArchivo);

  const { anuncio, archivosCreados } = await prisma.$transaction(async (tx) => {
    const anuncio = await tx.anuncio.create({
      data: {
        autor_id: usuario.id,
        carrera_id: destino,
        flair_id: flair_id ?? null,
        titulo,
        contenido: contenido ?? null,
        hashtags: { create: hashtagsCreate },
      },
      include: INCLUDE_ANUNCIO,
    });

    const archivosCreados = [];
    for (const data of datosArchivos) {
      archivosCreados.push(
        await tx.archivo.create({
          data: {
            tipo_contenido: 'anuncio',
            contenido_id: anuncio.id,
            ...data,
          },
        }),
      );
    }
    return { anuncio, archivosCreados };
  });

  return formatearAnuncio(anuncio, { archivos: archivosCreados });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarAnuncio(id, usuario, datos) {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id },
    select: { autor_id: true, carrera_id: true },
  });
  if (!anuncio) throw new NotFoundError('Anuncio');

  if (!puedeEditarAnuncio(usuario, anuncio)) {
    throw new ForbiddenError('No tienes permiso para editar este anuncio');
  }

  const { titulo, contenido, flair_id, hashtags } = datos;
  if (flair_id) await exigirFlairDeLaCarrera(flair_id, anuncio.carrera_id);
  const hashtagsCreate = hashtags ? await resolverHashtags(hashtags) : null;

  const actualizado = await prisma.$transaction(async (tx) => {
    // si lo eliminan justo ahora, se espera y responde 404 en vez de un 500
    await bloquearContenido('anuncio', id, tx);

    return tx.anuncio.update({
      where: { id },
      data: {
        editado_en: new Date(),
        ...(titulo && { titulo }),
        ...(contenido !== undefined && { contenido }),
        ...(flair_id !== undefined && { flair_id }),
        ...(hashtagsCreate && {
          hashtags: { deleteMany: {}, create: hashtagsCreate },
        }),
      },
      include: INCLUDE_ANUNCIO,
    });
  });

  const [formateado] = await formatearAnuncios([actualizado], usuario.id);
  return formateado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarAnuncio(id, usuario, { respuesta = null } = {}) {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id },
    select: { autor_id: true, carrera_id: true },
  });
  if (!anuncio) throw new NotFoundError('Anuncio');

  if (!puedeEliminarAnuncio(usuario, anuncio)) {
    throw new ForbiddenError('No tienes permiso para eliminar este anuncio');
  }

  const { archivos, reportes_a_notificar } = await prisma.$transaction(
    async (tx) => {
      // el bloqueo va primero. Solo evita carreras con comentarios nuevos cuando
      // crearComentario también bloquee el contenido (parte B6b)
      await bloquearContenido('anuncio', id, tx);

      const resultado = await eliminarContenido(tx, 'anuncio', id, {
        por_moderacion: esStaff(usuario.rol),
        revisor_id: usuario.id,
        respuesta,
      });
      await tx.anuncio.delete({ where: { id } }); // AnuncioHashtag cae por cascade
      return resultado;
    },
  );

  // después del commit: ni el correo ni el disco pueden revertir el borrado
  notificarReportesCerrados(reportes_a_notificar);
  await borrarArchivosFisicos(archivos);

  logger.info('Anuncio eliminado', {
    anuncio_id: id,
    eliminado_por: usuario.id,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarAnunciosGuardados(ids, usuario_id) {
  const anuncios = await prisma.anuncio.findMany({
    where: { id: { in: ids } },
    include: INCLUDE_ANUNCIO,
  });

  // se respeta el orden de `ids` y se omiten los anuncios que ya no existen
  const mapAnuncios = new Map(anuncios.map((a) => [a.id, a]));
  const ordenados = ids.map((id) => mapAnuncios.get(id)).filter(Boolean);

  return formatearAnuncios(ordenados, usuario_id, { extracto: true });
}
// ────────────────────────────────────────────────────────────────────────────────────────
function formatearAnuncio(
  anuncio,
  {
    extracto = false,
    comentarios = 0,
    archivos = [],
    cargo = null,
    mi_voto = null,
    esta_guardado = false,
  } = {},
) {
  const { texto, truncado } =
    extracto && anuncio.contenido
      ? recortar(anuncio.contenido, EXTRACTO_MAX)
      : { texto: anuncio.contenido, truncado: false };

  return {
    id: anuncio.id,
    tipo_contenido: 'anuncio',
    titulo: anuncio.titulo,
    contenido: texto,
    contenido_truncado: truncado,
    votos_neto: anuncio.votos_neto,
    mi_voto,
    esta_guardado,
    creado_en: anuncio.creado_en,
    editado_en: anuncio.editado_en,
    autor: {
      id: anuncio.autor.id,
      nombre_usuario: anuncio.autor.perfil?.nombre_usuario,
      cargo,
    },
    carrera: {
      id: anuncio.carrera.id,
      nombre: anuncio.carrera.nombre,
      codigo: anuncio.carrera.codigo,
    },
    flair: anuncio.flair ?? null,
    hashtags: nombresDeHashtags(anuncio.hashtags),
    archivos: archivos.map(formatearArchivo),
    comentarios_count: comentarios,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
registrarHidratadorGuardados('anuncio', hidratarAnunciosGuardados);
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarAnuncios,
  obtenerAnuncio,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio,
};
