import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../errors/appError.js';
import { ESTADOS_REPORTE } from './reports.constants.js';
import {
  verificarContenidoExiste,
  obtenerPropietarioContenido,
  obtenerVistasContenido,
} from '../content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
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
  await verificarContenidoExiste(tipo_contenido, contenido_id);
  const autor_id = await obtenerPropietarioContenido(
    tipo_contenido,
    contenido_id,
  );

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
    throw new ConflictError(
      'Ya reportaste este contenido, tu reporte está en revisión',
    );
  }

  const reporte = await prisma.reporte.create({
    data: {
      reportado_por: usuario_id,
      tipo_contenido,
      contenido_id,
      contenido_autor_id: autor_id,
      motivo,
      detalle: construirDetalle({ objetivo, detalle }),
    },
  });

  return {
    mensaje: 'Reporte enviado, gracias por avisarnos',
    reporte_id: reporte.id,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarReportesPropios(usuario_id) {
  const reportes = await prisma.reporte.findMany({
    where: { reportado_por: usuario_id },
    orderBy: { creado_en: 'desc' },
  });

  // agrupa los ids por tipo y pide las vistas previas de cada tipo al registry
  const idsPorTipo = {};
  for (const r of reportes) {
    (idsPorTipo[r.tipo_contenido] ??= []).push(r.contenido_id);
  }

  const previewsPorTipo = {};
  await Promise.all(
    Object.entries(idsPorTipo).map(async ([tipo, ids]) => {
      previewsPorTipo[tipo] = await obtenerVistasContenido(tipo, ids);
    }),
  );

  return reportes.map((r) => {
    const vista = previewsPorTipo[r.tipo_contenido]?.get(r.contenido_id);
    // "disponible" para quien reportó: existe y no fue eliminado. Un comentario
    // eliminado conserva su fila, pero su texto no debe mostrarse.
    const contenido_existe = !!vista && !vista.eliminado;

    return {
      id: r.id,
      tipo_contenido: r.tipo_contenido,
      motivo: r.motivo,
      detalle: r.detalle,
      estado: r.estado,
      nota_resolucion: r.nota_resolucion,
      creado_en: r.creado_en,
      contenido_existe,
      contenido_preview: contenido_existe ? vista.texto || null : null,
    };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// «Quitar de mi lista»: solo marca el reporte; nunca se borra. Únicamente los
// cerrados (un reporte cerrado no vuelve a pendiente, así que no hay carrera).
// Idempotente: repetirlo no falla.
async function ocultarReportePropio({ usuario_id, reporte_id }) {
  const { count } = await prisma.reporte.updateMany({
    where: {
      id: reporte_id,
      reportado_por: usuario_id,
      estado: { not: ESTADOS_REPORTE.PENDIENTE },
    },
    data: { oculto_por_reportante: true },
  });
  if (count > 0) return { mensaje: 'Reporte quitado de tu lista' };

  // no se actualizó nada: o no es suyo / no existe, o sigue pendiente
  const propio = await prisma.reporte.findFirst({
    where: { id: reporte_id, reportado_por: usuario_id },
    select: { id: true },
  });
  if (!propio) throw new NotFoundError('Reporte');
  throw new ConflictError(
    'Solo puedes quitar reportes que ya fueron cerrados',
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { crearReporte, listarReportesPropios, ocultarReportePropio };
