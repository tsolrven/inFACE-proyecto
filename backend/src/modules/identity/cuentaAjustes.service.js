import bcrypt from 'bcryptjs';
import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors/appError.js';

async function cambiarContrasenaUsuario(usuarioId, actual, nueva) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new NotFoundError('Usuario');

  const valida = await bcrypt.compare(actual, usuario.contrasena);
  if (!valida)
    throw new UnauthorizedError('La contraseña actual no es correcta');
  if (actual === nueva)
    throw new BadRequestError(
      'La nueva contraseña debe ser distinta a la actual',
    );

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      contrasena: await bcrypt.hash(nueva, 10),
      version_token: { increment: 1 },
    },
  });
  logger.info('Contraseña cambiada', { usuario_id: usuarioId });
  return { mensaje: 'Contraseña actualizada. Vuelve a iniciar sesión.' };
}

async function actualizarConsentimientoInvestigacion(usuarioId, acepta) {
  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      consentimiento_investigacion: acepta,
      consentimiento_investigacion_en: acepta ? new Date() : null,
    },
    select: { consentimiento_investigacion: true },
  });
  logger.info('Consentimiento de investigación actualizado', {
    usuario_id: usuarioId,
    acepta,
  });
  return usuario;
}

export { cambiarContrasenaUsuario, actualizarConsentimientoInvestigacion };
