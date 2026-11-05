import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { ConflictError, NotFoundError } from '../../errors/appError.js';
import {
  bloquearContenido,
  eliminarPorModeracion,
  obtenerEntradaRegistro,
  obtenerPreviewsContenido,
} from '../content/contentRegistry.js';
import { AUTOR_PUBLICO_SELECT } from '../content/selects.js';
import { recortar } from '../content/extracto.js';
import {
  enviarNotificacion,
  notificarReportesCerrados,
} from './reports.notifications.js';
import {
  ESTADOS_REPORTE,
  ESTADOS_NOTIFICACION,
  RESPUESTAS_PREDETERMINADAS,
} from './reports.constants.js';

const EXTRACTO_MAX = 280;
const CORREO_CON_PROBLEMA = [
  ESTADOS_NOTIFICACION.PENDIENTE,
  ESTADOS_NOTIFICACION.ENVIANDO,
  ESTADOS_NOTIFICACION.FALLIDA,
];

const extracto = (texto) => recortar(texto ?? '', EXTRACTO_MAX).texto;
// ────────────────────────────────────────────────────────────────────────────────────────
function resolverRespuesta(resultado, respuesta) {
  if (respuesta.tipo === 'personalizada') {
    return { texto: respuesta.texto, personalizada: true };
  }
  return { texto: RESPUESTAS_PREDETERMINADAS[resultado], personalizada: false };
}

function obtenerRespuestasPredeterminadas() {
  return { ...RESPUESTAS_PREDETERMINADAS };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cola de moderación agrupada por contenido: un contenido con 5 reportes
// aparece una sola vez. `pendientes` = reportes abiertos; `historial` = cerrados.
// Un contenido con reportes abiertos y cerrados aparece en ambas vistas, y los
// conteos de cada una solo cuentan los reportes de esa vista.
async function listarReportesAgrupados({ vista, tipo, pagina, limite }) {
  const esHistorial = vista === 'historial';
  const campoOrden = esHistorial ? 'revisado_en' : 'creado_en';
  const por = ['tipo_contenido', 'contenido_id'];
  const where = {
    ...(tipo && { tipo_contenido: tipo }),
    estado: esHistorial
      ? { not: ESTADOS_REPORTE.PENDIENTE }
      : ESTADOS_REPORTE.PENDIENTE,
  };

  const [grupos, todosLosGrupos] = await Promise.all([
    prisma.reporte.groupBy({
      by: por,
      where,
      _max: { [campoOrden]: true },
      orderBy: [{ _max: { [campoOrden]: 'desc' } }, { contenido_id: 'asc' }],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.reporte.groupBy({ by: por, where }),
  ]);
  const total = todosLosGrupos.length;
  if (grupos.length === 0) return { items: [], total };

  const reportes = await prisma.reporte.findMany({
    where: {
      ...where,
      OR: grupos.map((g) => ({
        tipo_contenido: g.tipo_contenido,
        contenido_id: g.contenido_id,
      })),
    },
    select: {
      tipo_contenido: true,
      contenido_id: true,
      motivo: true,
      estado: true,
      notificacion_estado: true,
      contenido_snapshot: true,
    },
  });

  // vistas previas en vivo, una consulta por tipo
  const idsPorTipo = {};
  for (const g of grupos) {
    (idsPorTipo[g.tipo_contenido] ??= []).push(g.contenido_id);
  }
  const previewsPorTipo = {};
  await Promise.all(
    Object.entries(idsPorTipo).map(async ([t, ids]) => {
      previewsPorTipo[t] = await obtenerPreviewsContenido(t, ids);
    }),
  );

  const items = grupos.map((g) => {
    const propios = reportes.filter(
      (r) =>
        r.tipo_contenido === g.tipo_contenido &&
        r.contenido_id === g.contenido_id,
    );

    const motivos = {};
    const estados = {};
    let correos_con_problema = 0;
    for (const r of propios) {
      motivos[r.motivo] = (motivos[r.motivo] ?? 0) + 1;
      estados[r.estado] = (estados[r.estado] ?? 0) + 1;
      if (CORREO_CON_PROBLEMA.includes(r.notificacion_estado)) {
        correos_con_problema += 1;
      }
    }

    const vivo = previewsPorTipo[g.tipo_contenido]?.get(g.contenido_id);
    const snapshot = propios.find((r) => r.contenido_snapshot)
      ?.contenido_snapshot;
    const existe = vivo !== undefined;

    return {
      tipo_contenido: g.tipo_contenido,
      contenido_id: g.contenido_id,
      total_reportes: propios.length,
      ultimo_en: g._max[campoOrden],
      motivos: Object.entries(motivos)
        .map(([motivo, cantidad]) => ({ motivo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad),
      estados,
      correos_con_problema,
      contenido_existe: existe,
      titulo: existe ? extracto(vivo) : (snapshot?.titulo ?? null),
    };
  });

  return { items, total };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Todos los reportes de un contenido (abiertos y cerrados) con lo que necesita
// el moderador para decidir. No incluye el snapshot repetido en cada reporte.
async function obtenerReportesDeContenido(tipo_contenido, contenido_id) {
  const reportes = await prisma.reporte.findMany({
    where: { tipo_contenido, contenido_id },
    orderBy: { creado_en: 'desc' },
    select: {
      id: true,
      motivo: true,
      detalle: true,
      estado: true,
      creado_en: true,
      revisado_en: true,
      nota_resolucion: true,
      respuesta_personalizada: true,
      notificacion_estado: true,
      notificacion_intentos: true,
      notificacion_error: true,
      notificacion_enviada_en: true,
      contenido_snapshot: true,
      reportador: { select: AUTOR_PUBLICO_SELECT },
    },
  });
  if (reportes.length === 0) {
    throw new NotFoundError('Reportes de este contenido');
  }

  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const fila = await prisma[entrada.modelName].findUnique({
    where: { id: contenido_id },
  });
  const snapshot =
    reportes.find((r) => r.contenido_snapshot)?.contenido_snapshot ?? null;

  const autor_id = fila ? fila[entrada.ownerField] : snapshot?.autor_id;
  const autor = autor_id
    ? await prisma.usuario.findUnique({
      where: { id: autor_id },
      select: AUTOR_PUBLICO_SELECT,
    })
    : null;

  // un comentario se abre en el contenido al que pertenece
  const padre =
    tipo_contenido === 'comentario'
      ? fila
        ? { tipo: fila.tipo_contenido, id: fila.contenido_id }
        : (snapshot?.padre ?? null)
      : null;

  return {
    tipo_contenido,
    contenido_id,
    contenido: {
      existe: !!fila,
      titulo: fila ? extracto(fila[entrada.previewField]) : (snapshot?.titulo ?? null),
      autor,
      padre,
    },
    reportes: reportes.map(({ contenido_snapshot: _omitido, ...r }) => r),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cierra TODOS los reportes pendientes de un contenido con un mismo resultado y
// un mismo mensaje; cada reportante recibe su propio correo.
async function cerrarReportesDeContenido({
  tipo_contenido,
  contenido_id,
  resultado,
  respuesta,
  revisor,
}) {
  const mensaje = resolverRespuesta(resultado, respuesta);

  if (resultado === ESTADOS_REPORTE.CONTENIDO_ELIMINADO) {
    const pendientes = await prisma.reporte.count({
      where: { tipo_contenido, contenido_id, estado: ESTADOS_REPORTE.PENDIENTE },
    });
    if (pendientes === 0) {
      throw new ConflictError('Este contenido no tiene reportes pendientes');
    }
    // el módulo elimina el contenido y cierra los reportes en su transacción,
    // y dispara los correos después del commit
    await eliminarPorModeracion(tipo_contenido, contenido_id, revisor, mensaje);
    logger.info('Contenido eliminado desde reportes', {
      tipo_contenido,
      contenido_id,
      revisor_id: revisor.id,
      respuesta_personalizada: mensaje.personalizada,
    });
    return { resultado, reportes_cerrados: pendientes };
  }

  const ids = await prisma.$transaction(async (tx) => {
    // serializa cierres simultáneos del mismo contenido
    await bloquearContenido(tipo_contenido, contenido_id, tx);

    const pendientes = await tx.reporte.findMany({
      where: { tipo_contenido, contenido_id, estado: ESTADOS_REPORTE.PENDIENTE },
      select: { id: true },
    });
    if (pendientes.length === 0) {
      throw new ConflictError('Este contenido no tiene reportes pendientes');
    }
    const idsPendientes = pendientes.map((r) => r.id);

    await tx.reporte.updateMany({
      where: { id: { in: idsPendientes }, estado: ESTADOS_REPORTE.PENDIENTE },
      data: {
        estado: resultado,
        revisado_por: revisor.id,
        revisado_en: new Date(),
        nota_resolucion: mensaje.texto,
        respuesta_personalizada: mensaje.personalizada,
        notificacion_estado: ESTADOS_NOTIFICACION.PENDIENTE,
      },
    });
    return idsPendientes;
  });

  // después del commit: ni el correo puede revertir ni retrasar el cierre
  notificarReportesCerrados(ids);
  logger.info('Reportes cerrados', {
    tipo_contenido,
    contenido_id,
    resultado,
    revisor_id: revisor.id,
    cantidad: ids.length,
    respuesta_personalizada: mensaje.personalizada,
  });

  return { resultado, reportes_cerrados: ids.length };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Reintenta el correo de UN reporte (fallido, pendiente o atascado). Espera el
// envío: el moderador ve el resultado.
async function reintentarCorreoReporte(reporte_id) {
  const reporte = await prisma.reporte.findUnique({
    where: { id: reporte_id },
    select: { id: true },
  });
  if (!reporte) throw new NotFoundError('Reporte');

  const estado = await enviarNotificacion(reporte_id);
  if (estado === null) {
    throw new ConflictError(
      'El correo de este reporte no se puede reintentar: ya se envió, está en curso o no corresponde',
    );
  }
  return { notificacion_estado: estado };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  obtenerRespuestasPredeterminadas,
  listarReportesAgrupados,
  obtenerReportesDeContenido,
  cerrarReportesDeContenido,
  reintentarCorreoReporte,
};