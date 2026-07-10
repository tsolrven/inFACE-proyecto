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
export { crearReporte };
