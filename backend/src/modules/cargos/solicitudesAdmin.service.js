import { prisma } from '../../config/configDb.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/appError.js';
import { calcularVencimiento, hoyEnChile } from '../../shared/auth/cargos.js';
import { AUTOR_PUBLICO_SELECT } from '../../shared/content/selects.js';
import { bloquearContenido } from '../../shared/content/contentRegistry.js';
import {
  TIPOS_ACCION_ADMIN,
  registrarAccionAdmin,
} from '../../shared/moderation/adminActions.js';
import { notificar } from '../../shared/notifications/notifications.service.js';
import { ESTADOS_SOLICITUD } from './solicitudes.constants.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const DIA_MS = 24 * 60 * 60 * 1000;
const TIPO_CONTENIDO = 'solicitud_rol';
const ETIQUETA_CARGO = { cee: 'CEE', tutor: 'tutor' };
const CARRERA_SELECT = { select: { id: true, nombre: true, codigo: true } };

// Vigencia que tendría el cargo si se aprobara hoy. Sin cargo previo empieza
// hoy. Si ya hay una asignación no revocada que no ha terminado (la vigente o
// una renovación ya aprobada), empieza el día siguiente al último `hasta`, sin
// solapes. El vencimiento se calcula desde esa fecha de inicio. La usan el
// detalle (lo que ve el superadmin) y, en la parte siguiente, la aprobación:
// así lo mostrado y lo guardado no pueden divergir.
async function calcularVigencia(client, { usuario_id, tipo, carrera_id }, hoy) {
  const ultima = await client.asignacionRol.findFirst({
    where: {
      usuario_id,
      tipo,
      carrera_id,
      revocada_en: null,
      hasta: { gte: hoy },
    },
    orderBy: { hasta: 'desc' },
    select: { hasta: true },
  });
  const desde = ultima ? new Date(ultima.hasta.getTime() + DIA_MS) : hoy;
  return {
    desde,
    hasta: calcularVencimiento(tipo, desde),
    renovacion: !!ultima,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
const SOLICITANTE_SELECT = {
  id: true,
  perfil: { select: { nombre_usuario: true, nombre_completo: true } },
};

// Los superadmins sí ven quién resolvió (trazabilidad). Sin correo del
// solicitante: la moderación no lo necesita.
function formatearSolicitudAdmin(s, adminId) {
  return {
    id: s.id,
    tipo: s.tipo,
    carrera: s.carrera,
    mensaje: s.mensaje,
    estado: s.estado,
    creado_en: s.creado_en,
    resuelta_en: s.resuelta_en,
    motivo_rechazo: s.motivo_rechazo,
    archivos_borrados_en: s.archivos_borrados_en,
    solicitante: {
      id: s.usuario.id,
      nombre_usuario: s.usuario.perfil?.nombre_usuario ?? null,
      nombre_completo: s.usuario.perfil?.nombre_completo ?? null,
    },
    resuelta_por: s.resolutor
      ? {
        id: s.resolutor.id,
        nombre_usuario: s.resolutor.perfil?.nombre_usuario ?? null,
      }
      : null,
    // un superadmin no resuelve su propia solicitud: la pantalla oculta el panel
    es_propia: s.usuario_id === adminId,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarSolicitudesAdmin({ estado, pagina, limite, adminId }) {
  const where = estado === 'todas' ? {} : { estado };
  // pendientes: las más antiguas primero (cola de revisión); el resto, las más
  // recientes primero
  const orden =
    estado === ESTADOS_SOLICITUD.PENDIENTE
      ? [{ creado_en: 'asc' }, { id: 'asc' }]
      : [{ creado_en: 'desc' }, { id: 'asc' }];

  const [total, filas] = await Promise.all([
    prisma.solicitudRol.count({ where }),
    prisma.solicitudRol.findMany({
      where,
      orderBy: orden,
      skip: (pagina - 1) * limite,
      take: limite,
      include: {
        carrera: CARRERA_SELECT,
        usuario: { select: SOLICITANTE_SELECT },
        resolutor: { select: AUTOR_PUBLICO_SELECT },
      },
    }),
  ]);

  const conteos = filas.length
    ? await prisma.archivo.groupBy({
      by: ['contenido_id'],
      where: {
        tipo_contenido: TIPO_CONTENIDO,
        contenido_id: { in: filas.map((f) => f.id) },
      },
      _count: { _all: true },
    })
    : [];
  const respaldosDe = new Map(
    conteos.map((c) => [c.contenido_id, c._count._all]),
  );

  const solicitudes = filas.map((s) => ({
    ...formatearSolicitudAdmin(s, adminId),
    cantidad_respaldos: respaldosDe.get(s.id) ?? 0,
  }));
  return { solicitudes, total };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function obtenerSolicitudAdmin(id, adminId) {
  const s = await prisma.solicitudRol.findUnique({
    where: { id },
    include: {
      carrera: CARRERA_SELECT,
      usuario: { select: SOLICITANTE_SELECT },
      resolutor: { select: AUTOR_PUBLICO_SELECT },
    },
  });
  if (!s) throw new NotFoundError('Solicitud');

  const archivos = await prisma.archivo.findMany({
    where: { tipo_contenido: TIPO_CONTENIDO, contenido_id: id },
    select: { id: true, nombre_archivo: true, tipo_mime: true, tamanio: true },
  });

  // solo tiene sentido mostrar la vigencia mientras se pueda aprobar
  const vigencia_propuesta =
    s.estado === ESTADOS_SOLICITUD.PENDIENTE
      ? await calcularVigencia(prisma, s, hoyEnChile())
      : null;

  return {
    ...formatearSolicitudAdmin(s, adminId),
    cantidad_respaldos: archivos.length,
    archivos,
    vigencia_propuesta,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Rechaza una solicitud pendiente. El motivo lo ve el solicitante; quién
// rechazó solo lo ven los superadmins. El texto del motivo NO va al historial.
async function rechazarSolicitud(id, adminId, motivo) {
  const rechazada = await prisma.$transaction(async (tx) => {
    // lanza NotFoundError si no existe
    await bloquearContenido(TIPO_CONTENIDO, id, tx);

    const solicitud = await tx.solicitudRol.findUnique({ where: { id } });
    if (solicitud.usuario_id === adminId) {
      throw new ForbiddenError(
        'No puedes resolver tu propia solicitud: debe resolverla otro moderador',
      );
    }
    if (solicitud.estado !== ESTADOS_SOLICITUD.PENDIENTE) {
      throw new ConflictError('La solicitud ya fue resuelta');
    }

    const actualizada = await tx.solicitudRol.update({
      where: { id },
      data: {
        estado: ESTADOS_SOLICITUD.RECHAZADA,
        resuelta_en: new Date(),
        resuelta_por: adminId,
        motivo_rechazo: motivo,
      },
      include: {
        carrera: CARRERA_SELECT,
        usuario: { select: SOLICITANTE_SELECT },
        resolutor: { select: AUTOR_PUBLICO_SELECT },
      },
    });

    await registrarAccionAdmin(tx, {
      admin_id: adminId,
      tipo: TIPOS_ACCION_ADMIN.SOLICITUD_RECHAZADA,
      entidad_tipo: TIPO_CONTENIDO,
      entidad_id: id,
      afectado_id: solicitud.usuario_id,
      detalle: { tipo: solicitud.tipo, carrera_id: solicitud.carrera_id },
    });

    return actualizada;
  });

  // Después del commit; notificar() no lanza. No se copia el motivo: la
  // campana lleva a /solicitar-cargo, donde ya se muestra.
  await notificar({
    usuarioId: rechazada.usuario_id,
    actorId: adminId,
    tipo: 'solicitud_cargo_resuelta',
    titulo: 'Solicitud de cargo rechazada',
    mensaje: `Tu solicitud del cargo de ${ETIQUETA_CARGO[rechazada.tipo]} en ${rechazada.carrera.nombre} fue rechazada. Revisa el motivo en Solicitar cargo.`,
    enlace: '/solicitar-cargo',
  });

  return formatearSolicitudAdmin(rechazada, adminId);
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  listarSolicitudesAdmin,
  obtenerSolicitudAdmin,
  rechazarSolicitud,
  calcularVigencia,
};