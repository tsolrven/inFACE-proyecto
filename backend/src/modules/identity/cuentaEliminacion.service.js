import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors/appError.js';


export const DIAS_RETENCION = 30;
const MS_DIA = 24 * 60 * 60 * 1000;

function fechaCierrePruebas() {
  const crudo = process.env.PRUEBAS_CIERRE;
  if (!crudo) return null;
  const fecha = new Date(crudo);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

async function solicitarEliminacionCuenta(usuarioId, contrasena) {
  if (!contrasena || typeof contrasena !== 'string')
    throw new BadRequestError('Debes escribir tu contraseña para confirmar');

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario || usuario.anonimizado_en) throw new NotFoundError('Usuario');

  const valida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!valida) throw new UnauthorizedError('La contraseña no es correcta');

  const programada = new Date(Date.now() + DIAS_RETENCION * MS_DIA);
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { eliminacion_programada_en: programada },
  });

  logger.info('Eliminación de cuenta solicitada', {
    usuario_id: usuarioId,
    programada,
  });
  return { eliminacion_programada_en: programada, dias: DIAS_RETENCION };
}

async function cancelarEliminacionCuenta(usuarioId) {
  await prisma.usuario.updateMany({
    where: { id: usuarioId, anonimizado_en: null },
    data: { eliminacion_programada_en: null },
  });
  logger.info('Eliminación de cuenta cancelada', { usuario_id: usuarioId });
  return { eliminacion_programada_en: null };
}

async function anonimizarUsuario(usuarioId) {
  const sufijo = usuarioId.replace(/-/g, '').slice(0, 10);
  const contrasena = await bcrypt.hash(
    crypto.randomBytes(32).toString('hex'),
    10,
  );

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        correo: `eliminado-${sufijo}@anonimo.invalid`,
        contrasena,
        esta_activo: false,
        version_token: { increment: 1 },
        eliminacion_programada_en: null,
        anonimizado_en: new Date(),
      },
    }),
    prisma.perfil.updateMany({
      where: { usuario_id: usuarioId },
      data: {
        nombre_usuario: `usuario-${sufijo}`,
        nombre_completo: null,
        biografia: null,
        campus: null,
      },
    }),
    prisma.notificacion.deleteMany({ where: { usuario_id: usuarioId } }),
  ]);
  logger.info('Cuenta anonimizada', { usuario_id: usuarioId });
}

async function procesarEliminacionesVencidas() {
  const ahora = new Date();
  const ids = new Set();

  const vencidas = await prisma.usuario.findMany({
    where: { anonimizado_en: null, eliminacion_programada_en: { lte: ahora } },
    select: { id: true },
  });
  vencidas.forEach((u) => ids.add(u.id));

  const cierre = fechaCierrePruebas();
  if (cierre && ahora.getTime() >= cierre.getTime() + DIAS_RETENCION * MS_DIA) {
    const resto = await prisma.usuario.findMany({
      where: { anonimizado_en: null, rol: { not: 'superadmin' } },
      select: { id: true },
    });
    resto.forEach((u) => ids.add(u.id));
  }

  for (const id of ids) {
    try {
      await anonimizarUsuario(id);
    } catch (error) {
      logger.error('No se pudo anonimizar una cuenta', {
        usuario_id: id,
        error: error.message,
      });
    }
  }
  return ids.size;
}

export {
  solicitarEliminacionCuenta,
  cancelarEliminacionCuenta,
  anonimizarUsuario,
  procesarEliminacionesVencidas,
};