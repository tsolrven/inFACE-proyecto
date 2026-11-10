import { prisma } from '../../config/configDb.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import { hoyEnChile } from '../../shared/auth/cargos.js';
import { ROLES, esStaff } from '../../shared/auth/permissions.js';
import {
  bloquearContenido,
  registrarPermisoAdjuntos,
  registrarPermisoLectura,
} from '../../shared/content/contentRegistry.js';
import { notificarVarios } from '../../shared/notifications/notifications.service.js';
import { ESTADOS_SOLICITUD, DIAS_RENOVACION } from './solicitudes.constants.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const DIA_MS = 24 * 60 * 60 * 1000;
const TIPO_CONTENIDO = 'solicitud_rol';
const ETIQUETA_CARGO = { cee: 'CEE', tutor: 'tutor' };
const CARRERA_SELECT = { select: { id: true, nombre: true, codigo: true } };

// Lo que ve el solicitante. No incluye quién resolvió ni la asignación creada.
function formatearSolicitud(s, archivos = []) {
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
    archivos: archivos.map((a) => ({
      id: a.id,
      nombre_archivo: a.nombre_archivo,
      tipo_mime: a.tipo_mime,
      tamanio: a.tamanio,
    })),
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearSolicitud({ usuario, tipo, carrera_id, mensaje }) {
  const hoy = hoyEnChile();

  const solicitud = await prisma.$transaction(async (tx) => {
    // serializa las solicitudes del mismo usuario (no hay índice único parcial)
    await tx.$queryRaw`SELECT id FROM "usuarios" WHERE id = ${usuario.id} FOR UPDATE`;

    const esSuCarrera = await tx.usuarioCarrera.findFirst({
      where: { usuario_id: usuario.id, carrera_id },
      select: { carrera_id: true },
    });
    if (!esSuCarrera) {
      throw new ForbiddenError(
        'Solo puedes solicitar un cargo en una de tus carreras',
      );
    }

    const pendiente = await tx.solicitudRol.findFirst({
      where: {
        usuario_id: usuario.id,
        tipo,
        carrera_id,
        estado: ESTADOS_SOLICITUD.PENDIENTE,
      },
      select: { id: true },
    });
    if (pendiente) {
      throw new ConflictError(
        'Ya tienes una solicitud pendiente para este cargo y carrera',
      );
    }

    // Último vencimiento entre las asignaciones no revocadas que no han
    // terminado, incluidas las que empiezan en el futuro (una renovación ya
    // aprobada): así no se puede pedir una segunda renovación encima.
    const ultima = await tx.asignacionRol.findFirst({
      where: {
        usuario_id: usuario.id,
        tipo,
        carrera_id,
        revocada_en: null,
        hasta: { gte: hoy },
      },
      orderBy: { hasta: 'desc' },
      select: { hasta: true },
    });
    if (ultima) {
      const dias = Math.round(
        (ultima.hasta.getTime() - hoy.getTime()) / DIA_MS,
      );
      if (dias > DIAS_RENOVACION) {
        throw new ConflictError(
          `Ya tienes este cargo. Podrás solicitar su renovación cuando falten ${DIAS_RENOVACION} días o menos para su vencimiento`,
        );
      }
    }

    return tx.solicitudRol.create({
      data: { usuario_id: usuario.id, tipo, carrera_id, mensaje },
      include: { carrera: CARRERA_SELECT },
    });
  });

  await avisarSuperadmins(solicitud, usuario.id);

  return formatearSolicitud(solicitud);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Campana a todos los superadmins activos salvo quien solicita. La solicitud ya
// está guardada: un fallo aquí se registra y no debe devolver error al usuario.
async function avisarSuperadmins(solicitud, solicitante_id) {
  try {
    const [admins, solicitante] = await Promise.all([
      prisma.usuario.findMany({
        where: { rol: ROLES.SUPERADMIN, esta_activo: true },
        select: { id: true },
      }),
      prisma.usuario.findUnique({
        where: { id: solicitante_id },
        select: { perfil: { select: { nombre_usuario: true } } },
      }),
    ]);
    const quien = solicitante?.perfil?.nombre_usuario ?? 'Un usuario';
    await notificarVarios({
      usuarioIds: admins.map((a) => a.id),
      actorId: solicitante_id,
      tipo: 'solicitud_cargo',
      titulo: 'Nueva solicitud de cargo',
      mensaje: `${quien} solicita el cargo de ${ETIQUETA_CARGO[solicitud.tipo]} en ${solicitud.carrera.nombre}`,
      enlace: '/admin/solicitudes',
    });
  } catch (err) {
    logger.error('No se pudo avisar a los superadmins de una solicitud', {
      solicitud_id: solicitud.id,
      error: err.message,
    });
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function listarMisSolicitudes(usuario_id, { pagina, limite }) {
  const where = { usuario_id };
  const [total, filas] = await Promise.all([
    prisma.solicitudRol.count({ where }),
    prisma.solicitudRol.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
      include: { carrera: CARRERA_SELECT },
    }),
  ]);

  const archivos = filas.length
    ? await prisma.archivo.findMany({
      where: {
        tipo_contenido: TIPO_CONTENIDO,
        contenido_id: { in: filas.map((f) => f.id) },
      },
    })
    : [];

  const solicitudes = filas.map((s) =>
    formatearSolicitud(
      s,
      archivos.filter((a) => a.contenido_id === s.id),
    ),
  );
  return { solicitudes, total };
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function cancelarSolicitud(id, usuario) {
  const cancelada = await prisma.$transaction(async (tx) => {
    await bloquearContenido(TIPO_CONTENIDO, id, tx);

    const solicitud = await tx.solicitudRol.findUnique({ where: { id } });
    // ajena = inexistente: no se revela que existe
    if (!solicitud || solicitud.usuario_id !== usuario.id) {
      throw new NotFoundError('Solicitud');
    }
    if (solicitud.estado !== ESTADOS_SOLICITUD.PENDIENTE) {
      throw new ConflictError('La solicitud ya fue resuelta');
    }

    return tx.solicitudRol.update({
      where: { id },
      // resuelta_en también marca el inicio de los 30 días de conservación
      // de los respaldos (P6f)
      data: {
        estado: ESTADOS_SOLICITUD.CANCELADA,
        resuelta_en: new Date(),
      },
      include: { carrera: CARRERA_SELECT },
    });
  });

  return formatearSolicitud(cancelada);
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Respaldos (los consulta files.service). Subir y eliminar: solo el solicitante
// y solo con la solicitud pendiente. Una solicitud ajena responde 404.
registrarPermisoAdjuntos(TIPO_CONTENIDO, async (usuario, solicitud_id) => {
  const solicitud = await prisma.solicitudRol.findUnique({
    where: { id: solicitud_id },
    select: { usuario_id: true, estado: true },
  });
  if (!solicitud || solicitud.usuario_id !== usuario.id) {
    throw new NotFoundError('Solicitud');
  }
  return solicitud.estado === ESTADOS_SOLICITUD.PENDIENTE;
});

// Leer (ver y descargar): el solicitante y los superadmins. files.service
// responde 404 cuando el hook devuelve false.
registrarPermisoLectura(TIPO_CONTENIDO, async (usuario, archivo) => {
  if (esStaff(usuario.rol)) return true;
  const solicitud = await prisma.solicitudRol.findUnique({
    where: { id: archivo.contenido_id },
    select: { usuario_id: true },
  });
  return solicitud?.usuario_id === usuario.id;
});
// ────────────────────────────────────────────────────────────────────────────────────────
export { crearSolicitud, listarMisSolicitudes, cancelarSolicitud };