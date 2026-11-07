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
import { registrarHidratadorGuardados } from '../../shared/content/contentRegistry.js';
import { obtenerEnriquecimiento } from '../../shared/content/contentEnrichment.js';
import { esStaff } from '../../shared/auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
import {
  INCLUDE_HASHTAGS,
  resolverHashtags,
  filtroPorHashtag,
  nombresDeHashtags,
} from '../../shared/hashtags/hashtags.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const EXTRACTO_MAX = 300;
const ORDEN = { orden: 'asc' };

const TIPOS_CON_CAPITULOS = ['historia', 'guion'];
const TIPOS_CON_PERSONAJES = ['guion', 'audiovisual', 'historia'];

const INCLUDE_LISTA = {
  autor: { select: AUTOR_PUBLICO_SELECT },
  guion: { select: { id: true, titulo: true } },
  hashtags: INCLUDE_HASHTAGS,
  personajes: { select: { id: true, imagen_id: true }, orderBy: ORDEN },
  pistas: { select: { id: true, archivo_id: true }, orderBy: ORDEN },
  _count: { select: { capitulos: { where: { borrador: false } } } },
};

const INCLUDE_DETALLE = {
  ...INCLUDE_LISTA,
  capitulos: { orderBy: ORDEN },
  personajes: { orderBy: ORDEN },
  pistas: { orderBy: ORDEN },
};
// ────────────────────────────────────────────────────────────────────────────────────────
function recortar(texto, max) {
  const caracteres = [...texto];
  return caracteres.length > max
    ? { texto: caracteres.slice(0, max).join(''), truncado: true }
    : { texto, truncado: false };
}

function formatearObra(
  obra,
  {
    extracto = false,
    comentarios = 0,
    archivos = [],
    mi_voto = null,
    esta_guardado = false,
  } = {},
) {
  const desc =
    extracto && obra.descripcion
      ? recortar(obra.descripcion, EXTRACTO_MAX)
      : { texto: obra.descripcion, truncado: false };
  const base = obra.texto ?? '';
  const txt =
    extracto && base
      ? recortar(base, obra.tipo === 'poema' ? 1500 : EXTRACTO_MAX)
      : { texto: obra.texto, truncado: false };

  const especiales = new Set(
    [
      obra.portada_id,
      ...obra.personajes.map((p) => p.imagen_id),
      ...obra.pistas.map((p) => p.archivo_id),
    ].filter(Boolean),
  );

  return {
    id: obra.id,
    tipo_contenido: 'obra',
    tipo: obra.tipo,
    titulo: obra.titulo,
    borrador: obra.borrador,
    descripcion: desc.texto,
    descripcion_truncada: desc.truncado,
    texto: txt.texto,
    texto_truncado: txt.truncado,
    enlace_url: obra.enlace_url,
    es_galeria: obra.es_galeria,
    portada_id: obra.portada_id,
    firma: obra.firma,
    estilo: obra.estilo,
    guion: obra.guion ? { id: obra.guion.id, titulo: obra.guion.titulo } : null,
    votos_neto: obra.votos_neto,
    mi_voto,
    esta_guardado,
    creado_en: obra.creado_en,
    editado_en: obra.editado_en,
    autor: {
      id: obra.autor.id,
      nombre_usuario: obra.autor.perfil?.nombre_usuario,
    },
    hashtags: nombresDeHashtags(obra.hashtags),
    archivos: archivos
      .filter((a) => !especiales.has(a.id))
      .map(formatearArchivo),
    comentarios_count: comentarios,
    capitulos_count: obra._count?.capitulos ?? obra.capitulos?.length ?? 0,
    personajes_count: obra.personajes.length,
    pistas_count: obra.pistas.length,
    ...(obra.capitulos && {
      capitulos: obra.capitulos.map((c) => ({
        id: c.id,
        orden: c.orden,
        titulo: c.titulo,
        contenido: c.contenido,
        borrador: c.borrador,
      })),
    }),
    ...(obra.capitulos && {
      pistas: obra.pistas.map((p) => ({
        id: p.id,
        orden: p.orden,
        titulo: p.titulo,
        enlace_url: p.enlace_url,
        archivo_id: p.archivo_id,
      })),
    }),
    ...(obra.capitulos && {
      personajes: obra.personajes.map((p) => ({
        id: p.id,
        orden: p.orden,
        nombre: p.nombre,
        descripcion: p.descripcion,
        imagen_id: p.imagen_id,
      })),
    }),
  };
}

async function formatearObras(obras, usuario_id, opciones = {}) {
  const ids = obras.map((o) => o.id);
  const { mapVotos, setGuardados, mapComentarios, mapArchivos } =
    await obtenerEnriquecimiento('obra', ids, usuario_id);

  return obras.map((o) =>
    formatearObra(o, {
      ...opciones,
      comentarios: mapComentarios.get(o.id) ?? 0,
      archivos: mapArchivos.get(o.id) ?? [],
      mi_voto: mapVotos.get(o.id) ?? null,
      esta_guardado: setGuardados.has(o.id),
    }),
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarObras({
  tipo,
  hashtag,
  orden = 'recientes',
  solo_mias = false,
  busqueda,
  pagina = 1,
  limite = 20,
  usuario_id,
}) {
  const where = { AND: [] };
  if (tipo?.length) where.AND.push({ tipo: { in: tipo } });
  if (hashtag) where.AND.push({ hashtags: filtroPorHashtag(hashtag) });
  if (solo_mias) {
    where.AND.push({ autor_id: usuario_id });
  } else {
    where.AND.push({ borrador: false });
    where.AND.push({
      OR: [
        { tipo: { notIn: TIPOS_CON_CAPITULOS } },
        { capitulos: { some: { borrador: false } } },
      ],
    });
  }
  if (busqueda) {
    where.AND.push({
      OR: [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        {
          pistas: {
            some: { titulo: { contains: busqueda, mode: 'insensitive' } },
          },
        },
      ],
    });
  }

  const orderBy =
    orden === 'populares'
      ? [{ votos_neto: 'desc' }, { creado_en: 'desc' }, { id: 'desc' }]
      : [{ creado_en: 'desc' }, { id: 'desc' }];

  const [obras, total] = await Promise.all([
    prisma.obra.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
      include: INCLUDE_LISTA,
    }),
    prisma.obra.count({ where }),
  ]);

  return {
    obras: await formatearObras(obras, usuario_id, { extracto: true }),
    total,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerObra(id, usuario_id) {
  const obra = await prisma.obra.findUnique({
    where: { id },
    include: INCLUDE_DETALLE,
  });
  if (!obra) throw new NotFoundError('Obra');
  const esAutor = obra.autor_id === usuario_id;
  if (obra.borrador && !esAutor) throw new NotFoundError('Obra');
  if (!esAutor) obra.capitulos = obra.capitulos.filter((c) => !c.borrador);
  const [formateada] = await formatearObras([obra], usuario_id);
  return formateada;
}
// ────────────────────────────────────────────────────────────────────────────────────────
function validarContenidoPorTipo(tipo, datos, cantidadArchivos) {
  const { enlace_url, texto, capitulos, es_galeria } = datos; // pistas: ver regla de álbum
  const reglas = {
    musica: () =>
      !enlace_url &&
      cantidadArchivos === 0 &&
      'Sube un audio (mp3, wav, ogg, m4a) o pega un enlace de Spotify, SoundCloud o YouTube',
    album: () =>
      !(datos.pistas?.length > 0) && 'Agrega al menos una pista a tu álbum',
    visual: () =>
      (cantidadArchivos === 0 && 'Sube al menos una imagen de tu obra') ||
      (es_galeria &&
        cantidadArchivos < 2 &&
        'Una galería necesita al menos 2 imágenes') ||
      (!es_galeria &&
        cantidadArchivos > 1 &&
        'Una foto única lleva una sola imagen: usa una galería'),
    audiovisual: () =>
      !enlace_url && 'Pega el enlace de tu video (YouTube o Vimeo)',
    poema: () => !texto && 'Escribe tu poema',
    historia: () =>
      !(capitulos?.length > 0) &&
      'Publica al menos un capítulo (o guarda la historia como borrador)',
    guion: () =>
      !(capitulos?.length > 0) &&
      'Publica al menos una escena (o guarda la obra como borrador)',
  };
  const mensaje = reglas[tipo]();
  if (mensaje) throw new BadRequestError(mensaje);
}

async function exigirGuion(guion_id) {
  if (!guion_id) return;
  const guion = await prisma.obra.findUnique({
    where: { id: guion_id },
    select: { tipo: true },
  });
  if (!guion || guion.tipo !== 'guion') {
    throw new BadRequestError('La obra de teatro seleccionada no existe');
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
const camposCapitulo = (c) => ({
  titulo: c.titulo,
  contenido: c.contenido ?? '',
  borrador: c.borrador ?? false,
});

function exigirCapitulosConTexto(capitulos = []) {
  const vacio = capitulos.findIndex((c) => !c.borrador && !c.contenido?.trim());
  if (vacio >= 0) {
    throw new BadRequestError(
      `El capítulo ${vacio + 1} está vacío: escríbelo o déjalo en borrador`,
    );
  }
}

async function validarPublicacion(tx, id) {
  const o = await tx.obra.findUnique({
    where: { id },
    include: {
      capitulos: true,
      pistas: true,
      personajes: { select: { imagen_id: true } },
    },
  });
  const especiales = [
    o.portada_id,
    ...o.personajes.map((p) => p.imagen_id),
    ...o.pistas.map((p) => p.archivo_id),
  ].filter(Boolean);
  const cantidadArchivos = await tx.archivo.count({
    where: {
      tipo_contenido: 'obra',
      contenido_id: id,
      ...(especiales.length > 0 && { id: { notIn: especiales } }),
    },
  });
  validarContenidoPorTipo(
    o.tipo,
    {
      enlace_url: o.enlace_url,
      texto: o.texto,
      capitulos: o.capitulos.filter((c) => !c.borrador),
      es_galeria: o.es_galeria,
      pistas: o.pistas,
    },
    cantidadArchivos,
  );
}
const camposPersonaje = (p) => ({
  nombre: p.nombre,
  descripcion: p.descripcion ?? null,
});

async function sincronizarLista(
  tx,
  delegate,
  obra_id,
  lista,
  campos,
  alEliminar,
) {
  const existentes = await delegate.findMany({
    where: { obra_id },
    select: { id: true },
  });
  const idsExistentes = new Set(existentes.map((e) => e.id));
  const conservar = new Set(
    lista.filter((i) => i.id && idsExistentes.has(i.id)).map((i) => i.id),
  );
  const borrar = [...idsExistentes].filter((id) => !conservar.has(id));
  if (borrar.length > 0) {
    await alEliminar?.(borrar);
    await delegate.deleteMany({ where: { id: { in: borrar } } });
  }
  for (const [orden, item] of lista.entries()) {
    if (item.id && conservar.has(item.id)) {
      await delegate.update({
        where: { id: item.id },
        data: { orden, ...campos(item) },
      });
    } else {
      await delegate.create({ data: { obra_id, orden, ...campos(item) } });
    }
  }
}

const camposPista = (p) => ({
  titulo: p.titulo,
  enlace_url: p.enlace_url ?? null,
});

async function limpiarAudiosDePistas(tx, pista_ids, acumulador) {
  const pistas = await tx.albumPista.findMany({
    where: { id: { in: pista_ids }, archivo_id: { not: null } },
    select: { archivo_id: true },
  });
  const ids = pistas.map((p) => p.archivo_id);
  if (ids.length === 0) return;
  acumulador.push(
    ...(await tx.archivo.findMany({ where: { id: { in: ids } } })),
  );
  await tx.archivo.deleteMany({ where: { id: { in: ids } } });
}

async function limpiarParrafosDeCapitulos(tx, capitulo_ids) {
  const parrafos = await tx.capituloParrafo.findMany({
    where: { capitulo_id: { in: capitulo_ids } },
    select: { id: true },
  });
  for (const p of parrafos) await eliminarContenido(tx, 'parrafo', p.id);
}

async function limpiarImagenesDePersonajes(tx, personaje_ids, acumulador) {
  const personajes = await tx.guionPersonaje.findMany({
    where: { id: { in: personaje_ids }, imagen_id: { not: null } },
    select: { imagen_id: true },
  });
  const ids = personajes.map((p) => p.imagen_id);
  if (ids.length === 0) return;
  acumulador.push(
    ...(await tx.archivo.findMany({ where: { id: { in: ids } } })),
  );
  await tx.archivo.deleteMany({ where: { id: { in: ids } } });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearObra({
  autor_id,
  tipo,
  titulo,
  borrador = false,
  descripcion,
  texto,
  enlace_url,
  es_galeria = false,
  guion_id = null,
  firma = null,
  estilo = null,
  hashtags = [],
  capitulos = [],
  personajes = [],
  pistas = [],
  archivos = [],
}) {
  if (!borrador) {
    exigirCapitulosConTexto(capitulos);
    validarContenidoPorTipo(
      tipo,
      {
        enlace_url,
        texto,
        capitulos: capitulos.filter((c) => !c.borrador),
        es_galeria,
        pistas,
      },
      archivos.length,
    );
  }
  if (tipo === 'audiovisual') await exigirGuion(guion_id);

  const hashtagsCreate = await resolverHashtags(hashtags);
  const datosArchivos = archivos.map(datosArchivo);
  const esPoema = tipo === 'poema';

  const obra = await prisma.$transaction(async (tx) => {
    const creada = await tx.obra.create({
      data: {
        autor_id,
        tipo,
        titulo,
        borrador,
        descripcion: descripcion ?? null,
        texto: esPoema ? (texto ?? null) : null,
        enlace_url: enlace_url ?? null,
        es_galeria: tipo === 'visual' ? es_galeria : false,
        guion_id: tipo === 'audiovisual' ? guion_id : null,
        firma: esPoema ? firma : null,
        estilo: esPoema
          ? (estilo ?? { fuente: 'lora', alineacion: 'centro' })
          : undefined,
        hashtags: { create: hashtagsCreate },
        ...(TIPOS_CON_CAPITULOS.includes(tipo) && {
          capitulos: {
            create: capitulos.map((c, orden) => ({
              orden,
              ...camposCapitulo(c),
            })),
          },
        }),
        ...(tipo === 'album' && {
          pistas: {
            create: pistas.map((p, orden) => ({ orden, ...camposPista(p) })),
          },
        }),
        ...(TIPOS_CON_PERSONAJES.includes(tipo) && {
          personajes: {
            create: personajes.map((p, orden) => ({
              orden,
              ...camposPersonaje(p),
            })),
          },
        }),
      },
    });
    for (const data of datosArchivos) {
      await tx.archivo.create({
        data: { tipo_contenido: 'obra', contenido_id: creada.id, ...data },
      });
    }
    return creada;
  });

  return obtenerObra(obra.id, autor_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function actualizarObra(id, usuario_id, datos) {
  const obra = await prisma.obra.findUnique({ where: { id } });
  if (!obra) throw new NotFoundError('Obra');
  if (obra.autor_id !== usuario_id) {
    throw new ForbiddenError('Solo el autor puede editar esta obra');
  }

  const {
    titulo,
    borrador,
    descripcion,
    texto,
    enlace_url,
    guion_id,
    firma,
    estilo,
    hashtags,
    capitulos,
    personajes,
    pistas,
  } = datos;

  const seraBorrador = borrador ?? obra.borrador;
  if (!seraBorrador) {
    if (capitulos !== undefined) exigirCapitulosConTexto(capitulos);
    if (obra.tipo === 'poema' && texto !== undefined && !texto) {
      throw new BadRequestError('El poema no puede quedar vacío');
    }
    if (obra.tipo === 'album' && pistas !== undefined && pistas.length === 0) {
      throw new BadRequestError('Un álbum necesita al menos una pista');
    }
    if (
      obra.tipo === 'audiovisual' &&
      enlace_url !== undefined &&
      !enlace_url
    ) {
      throw new BadRequestError('Una obra audiovisual necesita su enlace');
    }
  }
  if (obra.tipo === 'audiovisual' && guion_id !== undefined) {
    await exigirGuion(guion_id);
  }
  const hashtagsCreate = hashtags ? await resolverHashtags(hashtags) : null;

  const archivosABorrar = [];
  await prisma.$transaction(async (tx) => {
    if (TIPOS_CON_CAPITULOS.includes(obra.tipo) && capitulos !== undefined) {
      await sincronizarLista(
        tx,
        tx.guionCapitulo,
        id,
        capitulos,
        camposCapitulo,
        (ids) => limpiarParrafosDeCapitulos(tx, ids),
      );
    }
    if (TIPOS_CON_PERSONAJES.includes(obra.tipo) && personajes !== undefined) {
      await sincronizarLista(
        tx,
        tx.guionPersonaje,
        id,
        personajes,
        camposPersonaje,
        (ids) => limpiarImagenesDePersonajes(tx, ids, archivosABorrar),
      );
    }
    if (obra.tipo === 'album' && pistas !== undefined) {
      await sincronizarLista(
        tx,
        tx.albumPista,
        id,
        pistas,
        camposPista,
        (ids) => limpiarAudiosDePistas(tx, ids, archivosABorrar),
      );
    }
    await tx.obra.update({
      where: { id },
      data: {
        ...(!(obra.borrador && borrador === false) && {
          editado_en: new Date(),
        }),
        ...(borrador !== undefined && { borrador }),
        ...(titulo && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(obra.tipo === 'poema' && texto !== undefined && { texto }),
        ...(obra.tipo === 'poema' && firma !== undefined && { firma }),
        ...(obra.tipo === 'poema' && estilo !== undefined && { estilo }),
        ...(enlace_url !== undefined && { enlace_url }),
        ...(obra.tipo === 'audiovisual' &&
          guion_id !== undefined && { guion_id }),
        ...(hashtagsCreate && {
          hashtags: { deleteMany: {}, create: hashtagsCreate },
        }),
      },
    });
    if (!seraBorrador) await validarPublicacion(tx, id);
  });
  await borrarArchivosFisicos(archivosABorrar);

  return obtenerObra(id, usuario_id);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function eliminarObra(id, usuario_id, rol) {
  const obra = await prisma.obra.findUnique({ where: { id } });
  if (!obra) throw new NotFoundError('Obra');
  if (obra.autor_id !== usuario_id && !esStaff(rol)) {
    throw new ForbiddenError('No tienes permiso para eliminar esta obra');
  }

  const archivos = await prisma.$transaction(async (tx) => {
    const capitulos = await tx.guionCapitulo.findMany({
      where: { obra_id: id },
      select: { id: true },
    });
    if (capitulos.length > 0) {
      await limpiarParrafosDeCapitulos(
        tx,
        capitulos.map((c) => c.id),
      );
    }
    const { archivos } = await eliminarContenido(tx, 'obra', id);
    await tx.obra.delete({ where: { id } }); // hashtags, capítulos y personajes caen por cascade
    return archivos;
  });

  await borrarArchivosFisicos(archivos);
  logger.info('Obra eliminada', { obra_id: id, eliminado_por: usuario_id });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function reemplazarImagenEspecial({
  obra_id,
  usuario_id,
  file,
  personaje_id = null,
  pista_id = null,
}) {
  const eliminarSubido = async () => {
    const { default: fs } = await import('fs');
    fs.unlink(file.path, () => { });
  };

  const obra = await prisma.obra.findUnique({ where: { id: obra_id } });
  if (!obra) {
    await eliminarSubido();
    throw new NotFoundError('Obra');
  }
  if (obra.autor_id !== usuario_id) {
    await eliminarSubido();
    throw new ForbiddenError('Solo el autor puede cambiar las imágenes');
  }
  let personaje = null;
  if (personaje_id) {
    personaje = await prisma.guionPersonaje.findFirst({
      where: { id: personaje_id, obra_id },
    });
    if (!personaje) {
      await eliminarSubido();
      throw new NotFoundError('Personaje');
    }
  }
  let pista = null;
  if (pista_id) {
    pista = await prisma.albumPista.findFirst({
      where: { id: pista_id, obra_id },
    });
    if (!pista) {
      await eliminarSubido();
      throw new NotFoundError('Pista');
    }
  }

  let datos;
  try {
    datos = datosArchivo(file);
  } catch (err) {
    await eliminarSubido();
    throw err;
  }
  if (pista && !datos.tipo_mime.startsWith('audio/')) {
    await eliminarSubido();
    throw new BadRequestError('Solo se aceptan audios (MP3, WAV, OGG o M4A)');
  }
  if (!pista && !datos.tipo_mime.startsWith('image/')) {
    await eliminarSubido();
    throw new BadRequestError(
      'Solo se aceptan imágenes (JPG, PNG, WEBP o GIF)',
    );
  }

  const anteriorId = pista
    ? pista.archivo_id
    : personaje
      ? personaje.imagen_id
      : obra.portada_id;
  const { nuevo, anteriores } = await prisma.$transaction(async (tx) => {
    const nuevo = await tx.archivo.create({
      data: { tipo_contenido: 'obra', contenido_id: obra_id, ...datos },
    });
    if (pista) {
      await tx.albumPista.update({
        where: { id: pista.id },
        data: { archivo_id: nuevo.id },
      });
    } else if (personaje) {
      await tx.guionPersonaje.update({
        where: { id: personaje.id },
        data: { imagen_id: nuevo.id },
      });
    } else {
      await tx.obra.update({
        where: { id: obra_id },
        data: { portada_id: nuevo.id },
      });
    }
    let anteriores = [];
    if (anteriorId) {
      anteriores = await tx.archivo.findMany({ where: { id: anteriorId } });
      await tx.archivo.deleteMany({ where: { id: anteriorId } });
    }
    return { nuevo, anteriores };
  });
  await borrarArchivosFisicos(anteriores);
  return formatearArchivo(nuevo);
}

async function quitarImagenEspecial({
  obra_id,
  usuario_id,
  personaje_id = null,
  pista_id = null,
}) {
  const obra = await prisma.obra.findUnique({ where: { id: obra_id } });
  if (!obra) throw new NotFoundError('Obra');
  if (obra.autor_id !== usuario_id) {
    throw new ForbiddenError('Solo el autor puede cambiar las imágenes');
  }
  let personaje = null;
  if (personaje_id) {
    personaje = await prisma.guionPersonaje.findFirst({
      where: { id: personaje_id, obra_id },
    });
    if (!personaje) throw new NotFoundError('Personaje');
  }
  let pista = null;
  if (pista_id) {
    pista = await prisma.albumPista.findFirst({
      where: { id: pista_id, obra_id },
    });
    if (!pista) throw new NotFoundError('Pista');
  }
  const anteriorId = pista
    ? pista.archivo_id
    : personaje
      ? personaje.imagen_id
      : obra.portada_id;
  if (!anteriorId) return;

  const anteriores = await prisma.$transaction(async (tx) => {
    if (pista) {
      await tx.albumPista.update({
        where: { id: pista.id },
        data: { archivo_id: null },
      });
    } else if (personaje) {
      await tx.guionPersonaje.update({
        where: { id: personaje.id },
        data: { imagen_id: null },
      });
    } else {
      await tx.obra.update({
        where: { id: obra_id },
        data: { portada_id: null },
      });
    }
    const archivos = await tx.archivo.findMany({ where: { id: anteriorId } });
    await tx.archivo.deleteMany({ where: { id: anteriorId } });
    return archivos;
  });
  await borrarArchivosFisicos(anteriores);
}
// ────────────────────────────────────────────────────────────────────────────────────────
const separarParrafos = (contenido) =>
  contenido
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

async function obtenerParrafosDeCapitulo(capitulo_id) {
  const capitulo = await prisma.guionCapitulo.findUnique({
    where: { id: capitulo_id },
    select: { id: true },
  });
  if (!capitulo) throw new NotFoundError('Capítulo');

  const parrafos = await prisma.capituloParrafo.findMany({
    where: { capitulo_id },
    select: { id: true, indice: true },
  });
  if (parrafos.length === 0) return {};

  const conteo = await prisma.comentario.groupBy({
    by: ['contenido_id'],
    where: {
      tipo_contenido: 'parrafo',
      contenido_id: { in: parrafos.map((p) => p.id) },
      eliminado: false,
    },
    _count: { _all: true },
  });
  const porId = new Map(conteo.map((c) => [c.contenido_id, c._count._all]));

  return Object.fromEntries(
    parrafos.map((p) => [
      p.indice,
      { id: p.id, comentarios: porId.get(p.id) ?? 0 },
    ]),
  );
}

async function resolverParrafo(capitulo_id, indice) {
  const capitulo = await prisma.guionCapitulo.findUnique({
    where: { id: capitulo_id },
    include: { obra: { select: { autor_id: true, tipo: true } } },
  });
  if (!capitulo) throw new NotFoundError('Capítulo');
  if (capitulo.obra.tipo !== 'historia') {
    throw new BadRequestError(
      'Solo las historias admiten comentarios por párrafo',
    );
  }
  const parrafos = separarParrafos(capitulo.contenido);
  if (indice >= parrafos.length) throw new NotFoundError('Párrafo');

  const parrafo = await prisma.capituloParrafo.upsert({
    where: { capitulo_id_indice: { capitulo_id, indice } },
    update: {},
    create: {
      capitulo_id,
      indice,
      autor_id: capitulo.obra.autor_id,
      extracto: [...parrafos[indice]].slice(0, 120).join(''),
    },
    select: { id: true },
  });
  return { id: parrafo.id };
}
async function listarComentariosDeParrafos(obra_id, usuario_id) {
  const obra = await prisma.obra.findUnique({
    where: { id: obra_id },
    select: { autor_id: true, borrador: true, tipo: true },
  });
  if (!obra || (obra.borrador && obra.autor_id !== usuario_id)) {
    throw new NotFoundError('Obra');
  }
  if (obra.tipo !== 'historia') return [];

  const capitulos = await prisma.guionCapitulo.findMany({
    where: {
      obra_id,
      ...(obra.autor_id !== usuario_id && { borrador: false }),
    },
    select: {
      id: true,
      titulo: true,
      orden: true,
      parrafos: { select: { id: true, indice: true, extracto: true } },
    },
    orderBy: ORDEN,
  });
  const porParrafo = new Map();
  for (const c of capitulos) {
    for (const p of c.parrafos)
      porParrafo.set(p.id, { capitulo: c, parrafo: p });
  }
  if (porParrafo.size === 0) return [];

  const comentarios = await prisma.comentario.findMany({
    where: {
      tipo_contenido: 'parrafo',
      contenido_id: { in: [...porParrafo.keys()] },
      eliminado: false,
      padre_id: null,
    },
    orderBy: { creado_en: 'desc' },
    take: 100,
    include: { autor: { select: AUTOR_PUBLICO_SELECT } },
  });

  return comentarios.map((c) => {
    const { capitulo, parrafo } = porParrafo.get(c.contenido_id);
    return {
      id: c.id,
      contenido: c.contenido,
      creado_en: c.creado_en,
      votos_neto: c.votos_neto,
      autor: {
        id: c.autor.id,
        nombre_usuario: c.autor.perfil?.nombre_usuario,
      },
      capitulo_orden: capitulo.orden,
      capitulo_titulo: capitulo.titulo,
      indice: parrafo.indice,
      extracto: parrafo.extracto,
    };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarHashtagsPopulares(limite = 30) {
  const filas = await prisma.hashtag.findMany({
    where: { obras: { some: { obra: { borrador: false } } } },
    select: { nombre: true, _count: { select: { obras: true } } },
    orderBy: [{ obras: { _count: 'desc' } }, { nombre: 'asc' }],
    take: limite,
  });
  return filas.map((f) => ({ nombre: f.nombre, total: f._count.obras }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function hidratarObrasGuardadas(ids, usuario_id) {
  const obras = await prisma.obra.findMany({
    where: { id: { in: ids } },
    include: INCLUDE_LISTA,
  });
  const mapa = new Map(obras.map((o) => [o.id, o]));
  const ordenadas = ids
    .map((id) => mapa.get(id))
    .filter((o) => o && (!o.borrador || o.autor_id === usuario_id));
  return formatearObras(ordenadas, usuario_id, { extracto: true });
}

registrarHidratadorGuardados('obra', hidratarObrasGuardadas);
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarObras,
  obtenerObra,
  crearObra,
  actualizarObra,
  eliminarObra,
  reemplazarImagenEspecial,
  quitarImagenEspecial,
  obtenerParrafosDeCapitulo,
  resolverParrafo,
  listarComentariosDeParrafos,
  listarHashtagsPopulares,
};