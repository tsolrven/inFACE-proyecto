import nodemailer from 'nodemailer';
import logger from '../logger.js';

let transporte = null;

function smtpConfigurado() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

function obtenerTransporte() {
  if (!transporte) {
    const puerto = Number(process.env.SMTP_PORT) || 587;
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporte;
}

async function enviarCorreo({ para, asunto, html, texto }) {
  if (!smtpConfigurado()) {
    logger.warn('SMTP sin configurar: correo NO enviado', { para, asunto });
    return false;
  }
  try {
    await obtenerTransporte().sendMail({
      from: process.env.SMTP_FROM || `InFACE <${process.env.SMTP_USER}>`,
      to: para,
      subject: asunto,
      html,
      text: texto,
    });
    logger.info('Correo enviado', { asunto });
    return true;
  } catch (error) {
    logger.error('No se pudo enviar el correo', {
      asunto,
      error: error.message,
    });
    return false;
  }
}

export { enviarCorreo, smtpConfigurado };
