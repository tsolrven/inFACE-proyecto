import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { enviarCorreo } from '../../lib/email/email.service.js';
import { plantillaRecuperacion } from '../../lib/email/plantillaRecuperacion.js';
import { BadRequestError } from '../../errors/appError.js';

const MINUTOS_VIGENCIA = 30;

function hashearToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function urlFrontend() {
  const base =
    process.env.FRONTEND_URL ||
    (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0];
  return base.trim().replace(/\/+$/, '');
}

async function solicitarRecuperacion(correo) {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario || !usuario.esta_activo || usuario.anonimizado_en) {
    logger.info('Recuperación pedida para un correo sin cuenta activa');
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.$transaction([
    prisma.tokenRecuperacion.deleteMany({
      where: { usuario_id: usuario.id, usado_en: null },
    }),
    prisma.tokenRecuperacion.create({
      data: {
        usuario_id: usuario.id,
        token_hash: hashearToken(token),
        expira_en: new Date(Date.now() + MINUTOS_VIGENCIA * 60 * 1000),
      },
    }),
  ]);

  const enlace = `${urlFrontend()}/restablecer-contrasena?token=${token}`;
  const { asunto, html, texto } = plantillaRecuperacion({
    enlace,
    minutos: MINUTOS_VIGENCIA,
  });
  await enviarCorreo({ para: usuario.correo, asunto, html, texto });
}

async function restablecerContrasena(token, nueva) {
  const registro = await prisma.tokenRecuperacion.findUnique({
    where: { token_hash: hashearToken(token) },
    include: { usuario: true },
  });

  if (
    !registro ||
    registro.usado_en ||
    registro.expira_en < new Date() ||
    !registro.usuario.esta_activo
  ) {
    throw new BadRequestError(
      'El enlace no es válido o ya venció. Pide uno nuevo.',
    );
  }

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuario_id },
      data: {
        contrasena: await bcrypt.hash(nueva, 10),
        version_token: { increment: 1 },
      },
    }),
    prisma.tokenRecuperacion.deleteMany({
      where: { usuario_id: registro.usuario_id },
    }),
  ]);

  logger.info('Contraseña restablecida por correo', {
    usuario_id: registro.usuario_id,
  });
  return { mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
}

export { solicitarRecuperacion, restablecerContrasena };
