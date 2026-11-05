import { obtenerEntradaRegistro } from '../content/contentRegistry.js';
import {
  ESTADOS_REPORTE,
  ESTADOS_NOTIFICACION,
  RESPUESTAS_PREDETERMINADAS,
} from './reports.constants.js';

const MAX_EXTRACTO = 280;

function recortar(texto) {
  const caracteres = Array.from(texto ?? '');
  if (caracteres.length <= MAX_EXTRACTO) return caracteres.join('');
  return `${caracteres.slice(0, MAX_EXTRACTO - 1).join('')}…`;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Copia mínima del contenido, para conservar el historial de moderación cuando
// el original ya no exista. Sin cuerpo completo ni archivos. El alcance depende
// del tipo: apunte e hilo cuelgan de un ramo (que puede estar en varias
// carreras), el anuncio tiene carrera, el comentario tiene a su padre.
async function armarSnapshot(tx, tipo_contenido, contenido_id) {
  const entrada = obtenerEntradaRegistro(tipo_contenido);
  const fila = await tx[entrada.modelName].findUnique({
    where: { id: contenido_id },
  });
  if (!fila) return null;

  const archivos = await tx.archivo.count({
    where: { tipo_contenido, contenido_id },
  });

  return {
    tipo: tipo_contenido,
    titulo: recortar(fila[entrada.previewField]),
    autor_id: fila[entrada.ownerField],
    creado_en: fila.creado_en.toISOString(),
    archivos,
    ...(fila.ramo_id && { ramo_id: fila.ramo_id }),
    ...(fila.carrera_id && { carrera_id: fila.carrera_id }),
    ...(tipo_contenido === 'comentario' && {
      padre: { tipo: fila.tipo_contenido, id: fila.contenido_id },
    }),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Cierra los reportes de contenidos que se están eliminando. Debe llamarse
// DENTRO de la transacción del borrado y ANTES de borrar las filas (el
// snapshot las lee).
//
// - Todos los reportes del contenido (también los ya cerrados) reciben el
//   snapshot, si aún no lo tienen.
// - Los pendientes pasan a `contenido_eliminado`.
//   · por_moderacion: se registra al revisor, se guarda la respuesta
//     predeterminada y el correo queda `pendiente` (lo envía R3 tras el commit).
//   · borrado por el autor: nadie revisó nada, no hay revisor ni correo (`omitida`).
//
// Devuelve los ids de reportes cuyo correo hay que enviar tras el commit.
async function cerrarReportesPorEliminacion(
  tx,
  { tipo_contenido, ids, por_moderacion, revisor_id = null, respuesta = null },
) {
  const reportes_a_notificar = [];
  if (ids.length === 0) return { reportes_a_notificar };

  const reportes = await tx.reporte.findMany({
    where: { tipo_contenido, contenido_id: { in: ids } },
    select: {
      id: true,
      contenido_id: true,
      estado: true,
      contenido_snapshot: true,
    },
  });
  if (reportes.length === 0) return { reportes_a_notificar };

  const porContenido = new Map();
  for (const r of reportes) {
    if (!porContenido.has(r.contenido_id)) porContenido.set(r.contenido_id, []);
    porContenido.get(r.contenido_id).push(r);
  }

  const ahora = new Date();

  for (const [contenido_id, grupo] of porContenido) {
    // no se sobrescribe un snapshot previo (ej: comentario ya borrado por su autor)
    const sinSnapshot = grupo
      .filter((r) => r.contenido_snapshot === null)
      .map((r) => r.id);
    if (sinSnapshot.length > 0) {
      const snapshot = await armarSnapshot(tx, tipo_contenido, contenido_id);
      if (snapshot) {
        await tx.reporte.updateMany({
          where: { id: { in: sinSnapshot } },
          data: { contenido_snapshot: snapshot },
        });
      }
    }

    const pendientes = grupo
      .filter((r) => r.estado === ESTADOS_REPORTE.PENDIENTE)
      .map((r) => r.id);
    if (pendientes.length === 0) continue;

    await tx.reporte.updateMany({
      where: { id: { in: pendientes }, estado: ESTADOS_REPORTE.PENDIENTE },
      data: {
        estado: ESTADOS_REPORTE.CONTENIDO_ELIMINADO,
        revisado_en: ahora,
        ...(por_moderacion
          ? {
            revisado_por: revisor_id,
            nota_resolucion:
              respuesta?.texto ??
              RESPUESTAS_PREDETERMINADAS[ESTADOS_REPORTE.CONTENIDO_ELIMINADO],
            respuesta_personalizada: respuesta?.personalizada ?? false,
            notificacion_estado: ESTADOS_NOTIFICACION.PENDIENTE,
          }
          : { notificacion_estado: ESTADOS_NOTIFICACION.OMITIDA }),
      },
    });

    if (por_moderacion) reportes_a_notificar.push(...pendientes);
  }

  return { reportes_a_notificar };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { cerrarReportesPorEliminacion };