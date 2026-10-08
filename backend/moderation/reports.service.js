import { prisma } from '../config/configDb.js';
import { BadRequestError, ConflictError } from '../errors/appError.js';
import {
  obtenerPropietarioContenido,
  obtenerPreviewsContenido,
} from '../shared/content/contentRegistry.js';
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
      previewsPorTipo[tipo] = await obtenerPreviewsContenido(tipo, ids);
    }),
  );

  return reportes.map((r) => {
    const previews = previewsPorTipo[r.tipo_contenido];
    const contenido_existe = previews?.has(r.contenido_id) ?? false;

    return {
      id: r.id,
      tipo_contenido: r.tipo_contenido,
      motivo: r.motivo,
      detalle: r.detalle,
      estado: r.estado,
      creado_en: r.creado_en,
      contenido_existe,
      contenido_preview: contenido_existe
        ? (previews.get(r.contenido_id) ?? null)
        : null,
    };
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { crearReporte, listarReportesPropios };
