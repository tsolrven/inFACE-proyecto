import crypto from 'node:crypto';
import { prisma } from '../../config/configDb.js';
import {
  AppError,
  BadRequestError,
  ConflictError,
} from '../../errors/appError.js';
import logger from '../../lib/logger.js';
import {
  enviarCorreo,
  smtpConfigurado,
} from '../../lib/email/email.service.js';
import { plantillaVerificacion } from '../../lib/email/verificacion.plantilla.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const LARGO_CODIGO = 6;
const VIGENCIA_MIN = 15;
const ESPERA_REENVIO_SEG = 60;
const MAX_INTENTOS = 5;
// ────────────────────────────────────────────────────────────────────────────────────────
// El código se guarda como HMAC, nunca en claro. La clave se deriva del secreto
// de acceso con un contexto propio, para no depender de una variable nueva.
function claveVerificacion() {
  return crypto
    .createHmac('sha256', process.env.JWT_ACCESS_SECRET)
    .update('verificacion-correo')
    .digest();
}

function hashearCodigo(correo, codigo) {
  return crypto
    .createHmac('sha256', claveVerificacion())
    .update(`${correo}:${codigo}`)
    .digest('hex');
}

function generarCodigo() {
  return String(crypto.randomInt(0, 10 ** LARGO_CODIGO)).padStart(
    LARGO_CODIGO,
    '0',
  );
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Envía un código de 6 dígitos al correo. Pedir otro reemplaza el anterior y
// reinicia los intentos; no se puede pedir otro antes de ESPERA_REENVIO_SEG.
async function solicitarCodigo(correo) {
  const existente = await prisma.usuario.findUnique({
    where: { correo },
    select: { id: true },
  });
  if (existente) throw new ConflictError('El correo ya está registrado');


  // limpieza oportunista: no se conservan códigos vencidos ni sus correos
  await prisma.verificacionCorreo.deleteMany({
    where: { expira_en: { lt: new Date() } },
  });
  
  const previa = await prisma.verificacionCorreo.findUnique({
    where: { correo },
  });
  if (previa) {
    const faltanSeg = Math.ceil(
      (previa.ultimo_envio_en.getTime() +
        ESPERA_REENVIO_SEG * 1000 -
        Date.now()) /
      1000,
    );
    if (faltanSeg > 0) {
      throw new AppError(
        `Espera ${faltanSeg} segundos antes de pedir otro código`,
        429,
        'TOO_MANY_REQUESTS',
      );
    }
  }

  const codigo = generarCodigo();
  const ahora = new Date();
  const datos = {
    codigo_hash: hashearCodigo(correo, codigo),
    expira_en: new Date(ahora.getTime() + VIGENCIA_MIN * 60 * 1000),
    intentos: 0,
    ultimo_envio_en: ahora,
  };
  await prisma.verificacionCorreo.upsert({
    where: { correo },
    create: { correo, ...datos },
    update: datos,
  });

  const { asunto, html, texto } = plantillaVerificacion({
    codigo,
    vigenciaMin: VIGENCIA_MIN,
  });
  const enviado = await enviarCorreo({ para: correo, asunto, html, texto });

  if (!enviado) {
    if (!smtpConfigurado() && process.env.NODE_ENV !== 'production') {
      // solo desarrollo: sin SMTP el código se lee en este log
      logger.warn(
        'Código de verificación (SOLO DESARROLLO, SMTP sin configurar)',
        { correo, codigo },
      );
    } else {
      // se borra para poder reintentar enseguida
      await prisma.verificacionCorreo.deleteMany({ where: { correo } });
      throw new AppError(
        'No pudimos enviar el correo de verificación. Intenta de nuevo en unos minutos.',
        503,
        'EMAIL_NO_ENVIADO',
      );
    }
  }

  return {
    vigencia_minutos: VIGENCIA_MIN,
    espera_reenvio_segundos: ESPERA_REENVIO_SEG,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Comprueba el código ANTES de crear la cuenta. Va fuera de la transacción del
// registro a propósito: si fallara dentro, el rollback deshacería el conteo de
// intentos fallidos y se podría adivinar el código sin límite.
async function verificarCodigo(correo, codigo) {
  const fila = await prisma.verificacionCorreo.findUnique({
    where: { correo },
  });
  if (!fila) {
    throw new BadRequestError(
      'Solicita un código de verificación para tu correo',
    );
  }
  if (fila.expira_en.getTime() < Date.now()) {
    await prisma.verificacionCorreo.deleteMany({ where: { correo } });
    throw new BadRequestError('El código venció. Solicita uno nuevo');
  }

  // reserva el intento de forma atómica: peticiones en paralelo no pasan del límite
  const { count } = await prisma.verificacionCorreo.updateMany({
    where: { correo, intentos: { lt: MAX_INTENTOS } },
    data: { intentos: { increment: 1 } },
  });
  if (count === 0) {
    throw new BadRequestError(
      'Superaste los intentos permitidos. Solicita un código nuevo',
    );
  }

  const esperado = Buffer.from(fila.codigo_hash, 'hex');
  const recibido = Buffer.from(hashearCodigo(correo, codigo), 'hex');
  if (!crypto.timingSafeEqual(esperado, recibido)) {
    throw new BadRequestError('El código es incorrecto');
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Consume el código dentro de la transacción que crea la cuenta: si la creación
// falla, el rollback deja el código vigente; si dos registros usan el mismo
// código a la vez, solo uno lo consume.
async function consumirVerificacion(tx, correo) {
  const { count } = await tx.verificacionCorreo.deleteMany({
    where: { correo },
  });
  if (count === 0) {
    throw new BadRequestError('El código ya fue usado. Solicita uno nuevo');
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
export {
  solicitarCodigo,
  verificarCodigo,
  consumirVerificacion,
  hashearCodigo,
  VIGENCIA_MIN,
  ESPERA_REENVIO_SEG,
};