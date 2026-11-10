import { prisma } from '../../config/configDb.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/appError.js';
import { ROLES } from '../auth/permissions.js';
import { AUTOR_PUBLICO_SELECT } from '../content/selects.js';
import {
  TIPOS_SANCION,
  TIPOS_CON_EFECTO,
  MOTIVO_MIN,
  MOTIVO_MAX,
  DIAS_MIN,
  DIAS_MAX,
  MS_DIA,
} from './sanctions.constants.js';
import {
  notificarSancion,
  notificarRevocacion,
} from './sanctions.notifications.js';
// ────────────────────────────────────────────────────────────────────────────────────────
// Vigente = no revocada y sin fecha de término o con término futuro.
// Sin cron: el vencimiento se evalúa al consultar.
function filtroVigente(ahora) {
  return { revocada_en: null, OR: [{ hasta: null }, { hasta: { gt: ahora } }] };
}

function estadoDeSancion(s, ahora = new Date()) {
  if (s.revocada_en) return 'revocada';
  if (s.hasta && s.hasta <= ahora) return 'vencida';
  return s.tipo === TIPOS_SANCION.ADVERTENCIA ? 'registrada' : 'vigente';
}
// ────────────────────────────────────────────────────────────────────────────────────────
function limpiarTexto(texto, etiqueta) {
  const limpio = String(texto ?? '').trim();
  if (limpio.length < MOTIVO_MIN || limpio.length > MOTIVO_MAX) {
    throw new BadRequestError(
      `${etiqueta} debe tener entre ${MOTIVO_MIN} y ${MOTIVO_MAX} caracteres`,
    );
  }
  return limpio;
}

// Devuelve la fecha de término (null = sin término) y valida que la
// combinación tipo / duración tenga sentido.
function calcularHasta({ tipo, dias, permanente }) {
  if (!Object.values(TIPOS_SANCION).includes(tipo)) {
    throw new BadRequestError('Tipo de sanción inválido');
  }
  if (tipo === TIPOS_SANCION.ADVERTENCIA) {
    if (dias != null || permanente) {
      throw new BadRequestError('La advertencia no tiene duración');
    }
    return null;
  }
  if (permanente) {
    if (tipo !== TIPOS_SANCION.SUSPENSION) {
      throw new BadRequestError('Solo la suspensión puede ser permanente');
    }
    if (dias != null) {
      throw new BadRequestError(
        'Una suspensión permanente no lleva duración en días',
      );
    }
    return null;
  }
  if (!Number.isInteger(dias) || dias < DIAS_MIN || dias > DIAS_MAX) {
    throw new BadRequestError(
      `La duración debe ser de ${DIAS_MIN} a ${DIAS_MAX} días`,
    );
  }
  return new Date(Date.now() + dias * MS_DIA);
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function crearSancion({
  usuario_id,
  tipo,
  motivo,
  dias,
  permanente = false,
  contenido_tipo,
  contenido_id,
  aplicada_por,
}) {
  const motivoLimpio = limpiarTexto(motivo, 'El motivo');
  const hasta = calcularHasta({ tipo, dias, permanente });
  if (!!contenido_tipo !== !!contenido_id) {
    throw new BadRequestError(
      'El contenido de referencia necesita tipo e id, o ninguno',
    );
  }

  const sancion = await prisma.$transaction(async (tx) => {
    // Bloquea la fila del usuario: dos sanciones simultáneas no pueden saltarse
    // la comprobación de «ya tiene una vigente».
    await tx.$queryRaw`SELECT id FROM "usuarios" WHERE id = ${usuario_id} FOR UPDATE`;

    const objetivo = await tx.usuario.findUnique({
      where: { id: usuario_id },
      select: { id: true, rol: true, anonimizado_en: true },
    });
    if (!objetivo) throw new NotFoundError('Usuario');
    if (objetivo.rol === ROLES.SUPERADMIN) {
      throw new ForbiddenError('No puedes sancionar a un superadmin');
    }
    if (objetivo.anonimizado_en) {
      throw new ConflictError(
        'La cuenta fue anonimizada: no admite nuevas sanciones',
      );
    }

    if (TIPOS_CON_EFECTO.includes(tipo)) {
      const vigente = await tx.sancion.findFirst({
        where: { usuario_id, tipo, ...filtroVigente(new Date()) },
        select: { id: true },
      });
      if (vigente) {
        throw new ConflictError(
          tipo === TIPOS_SANCION.SUSPENSION
            ? 'El usuario ya tiene una suspensión vigente. Revócala antes de aplicar otra.'
            : 'El usuario ya tiene una restricción vigente. Revócala antes de aplicar otra.',
        );
      }
    }

    return tx.sancion.create({
      data: {
        usuario_id,
        tipo,
        motivo: motivoLimpio,
        contenido_tipo: contenido_tipo ?? null,
        contenido_id: contenido_id ?? null,
        aplicada_por,
        hasta,
      },
    });
  });

  // después del commit y sin esperar: un fallo de aviso no afecta la sanción
  notificarSancion(sancion);
  return sancion;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Solo se revoca lo que sigue en pie: no revocada y sin haber vencido.
async function revocarSancion({
  usuario_id,
  sancion_id,
  revocada_por,
  motivo_revocacion,
}) {
  const ahora = new Date();
  const texto = motivo_revocacion?.trim()
    ? limpiarTexto(motivo_revocacion, 'El motivo de revocación')
    : null;

  const { count } = await prisma.sancion.updateMany({
    where: {
      id: sancion_id,
      usuario_id,
      usuario: { anonimizado_en: null },
      ...filtroVigente(ahora),
    },
    data: {
      revocada_en: ahora,
      revocada_por,
      motivo_revocacion: texto,
    },
  });

  if (count === 0) {
    const existente = await prisma.sancion.findFirst({
      where: { id: sancion_id, usuario_id },
      select: { usuario: { select: { anonimizado_en: true } } },
    });
    if (!existente) throw new NotFoundError('Sanción');
    if (existente.usuario.anonimizado_en) {
      throw new ConflictError(
        'La cuenta fue anonimizada: su historial es solo de lectura',
      );
    }
    throw new ConflictError('La sanción ya fue revocada o ya terminó');
  }

  const sancion = await prisma.sancion.findUnique({
    where: { id: sancion_id },
  });

  // después de la revocación y sin esperar: un fallo de aviso no la afecta
  notificarRevocacion(sancion);
  return sancion;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Sanciones con efecto que están en pie ahora: { restriccion, suspension }.
async function obtenerSancionesVigentes(usuario_id, client = prisma) {
  const filas = await client.sancion.findMany({
    where: {
      usuario_id,
      tipo: { in: TIPOS_CON_EFECTO },
      ...filtroVigente(new Date()),
    },
    orderBy: { creado_en: 'desc' },
  });
  return {
    restriccion: filas.find((f) => f.tipo === TIPOS_SANCION.RESTRICCION) ?? null,
    suspension: filas.find((f) => f.tipo === TIPOS_SANCION.SUSPENSION) ?? null,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Historial completo, de la más reciente a la más antigua.
async function listarSancionesDeUsuario(usuario_id) {
  const filas = await prisma.sancion.findMany({
    where: { usuario_id },
    orderBy: { creado_en: 'desc' },
    include: {
      aplicador: { select: AUTOR_PUBLICO_SELECT },
      revocador: { select: AUTOR_PUBLICO_SELECT },
    },
  });
  const ahora = new Date();
  return filas.map((s) => ({ ...s, estado: estadoDeSancion(s, ahora) }));
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  crearSancion,
  revocarSancion,
  obtenerSancionesVigentes,
  listarSancionesDeUsuario,
  estadoDeSancion,
  filtroVigente,
};