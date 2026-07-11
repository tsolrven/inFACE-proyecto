import { prisma } from '../config/configDb.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/appError.js';

// ────────────────────────────────────────────────────────────────────────────────────────
// Devuelve el autor_id del contenido a reportar y de paso valida que exista.
// Igual que voto.service.js, cortamos acá con 404 si el contenido_id no
// corresponde a nada real (evita reportes "huérfanos").
//
// Para agregar un módulo nuevo (ej. futuros foros, perfiles, etc.) solo hay
// que sumar un case acá — el resto del sistema de reportes ya funciona igual
// para cualquier tipo_contenido.
async function obtenerAutorDelContenido(tipo_contenido, contenido_id) {
  if (tipo_contenido === 'apunte') {
    const apunte = await prisma.apunte.findUnique({
      where: { id: contenido_id },
      select: { autor_id: true },
    });
    if (!apunte) throw new NotFoundError('Apunte');
    return apunte.autor_id;
  }

  if (tipo_contenido === 'comentario') {
    const comentario = await prisma.comentario.findUnique({
      where: { id: contenido_id },
      select: { autor_id: true },
    });
    if (!comentario) throw new NotFoundError('Comentario');
    return comentario.autor_id;
  }

  throw new BadRequestError(`Tipo de contenido "${tipo_contenido}" inválido`);
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Arma el texto que se guarda en "detalle": si el motivo requería precisar
// un objetivo (ej. acoso hacia mí / hacia un tercero), lo antepone como
// etiqueta legible para quien revise el reporte más adelante.
function construirDetalle({ objetivo, detalle }) {
  const partes = [];
  if (objetivo === 'propio') partes.push('[Acoso dirigido a: quien reporta]');
  if (objetivo === 'tercero') partes.push('[Acoso dirigido a: un tercero]');
  if (detalle) partes.push(detalle);
  return partes.length ? partes.join(' ') : null;
}

// ────────────────────────────────────────────────────────────────────────────────────────
async function crearReporte({
  usuario_id,
  tipo_contenido,
  contenido_id,
  motivo,
  detalle,
  objetivo,
}) {
  const autor_id = await obtenerAutorDelContenido(tipo_contenido, contenido_id);

  if (autor_id === usuario_id) {
    throw new BadRequestError('No puedes reportar tu propio contenido');
  }

  const reporteExistente = await prisma.reporte.findFirst({
    where: {
      reportado_por: usuario_id,
      tipo_contenido,
      contenido_id,
      estado: 'pendiente',
    },
    select: { id: true },
  });

  if (reporteExistente) {
    throw new ConflictError('Ya reportaste este contenido, tu reporte está en revisión');
  }

  const reporte = await prisma.reporte.create({
    data: {
      reportado_por: usuario_id,
      tipo_contenido,
      contenido_id,
      motivo,
      detalle: construirDetalle({ objetivo, detalle }),
    },
  });

  return { mensaje: 'Reporte enviado, gracias por avisarnos', reporte_id: reporte.id };
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Devuelve los reportes que el usuario ha hecho (nunca los que le hicieron a
// él), en orden cronológico descendente, con un preview del contenido
// reportado para que la UI no muestre solo un "contenido_id" en crudo.
//
// Igual que obtenerAutorDelContenido, cuando agregues un tipo_contenido
// nuevo hay que sumar acá cómo resolver su preview.
async function listarReportesPropios(usuario_id) {
  const reportes = await prisma.reporte.findMany({
    where: { reportado_por: usuario_id },
    orderBy: { creado_en: 'desc' },
  });

  const idsApuntes = reportes
    .filter((r) => r.tipo_contenido === 'apunte')
    .map((r) => r.contenido_id);
  const idsComentarios = reportes
    .filter((r) => r.tipo_contenido === 'comentario')
    .map((r) => r.contenido_id);

  const [apuntes, comentarios] = await Promise.all([
    idsApuntes.length
      ? prisma.apunte.findMany({
          where: { id: { in: idsApuntes } },
          select: { id: true, titulo: true },
        })
      : [],
    idsComentarios.length
      ? prisma.comentario.findMany({
          where: { id: { in: idsComentarios } },
          select: { id: true, contenido: true },
        })
      : [],
  ]);

  const mapaApuntes = new Map(apuntes.map((a) => [a.id, a]));
  const mapaComentarios = new Map(comentarios.map((c) => [c.id, c]));

  return reportes.map((r) => {
    let contenido_preview = null;
    let contenido_existe = true;

    if (r.tipo_contenido === 'apunte') {
      const apunte = mapaApuntes.get(r.contenido_id);
      contenido_existe = !!apunte;
      contenido_preview = apunte?.titulo ?? null;
    } else if (r.tipo_contenido === 'comentario') {
      const comentario = mapaComentarios.get(r.contenido_id);
      contenido_existe = !!comentario;
      contenido_preview = comentario?.contenido ?? null;
    }

    return {
      id: r.id,
      tipo_contenido: r.tipo_contenido,
      motivo: r.motivo,
      detalle: r.detalle,
      estado: r.estado,
      creado_en: r.creado_en,
      contenido_existe,
      contenido_preview,
    };
  });
}

// ────────────────────────────────────────────────────────────────────────────────────────
export { crearReporte, listarReportesPropios };
