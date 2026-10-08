//! rate limiting para rutas sensibles (protege contra fuerza bruta, credential stuffing y spam)

import rateLimit from 'express-rate-limit';

// ── por IP (rutas públicas, sin sesión) ────────────────────────────────────────────────

// límite estricto para login, pocos intentos, ventana corta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 intentos fallidos por IP en la ventana
  standardHeaders: true, // manda RateLimit-* headers al cliente
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message:
        'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.',
    },
  },
});

// límite más permisivo para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 15, // 15 intentos por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados intentos de registro. Intenta de nuevo más tarde.',
    },
  },
});

// ── por usuario (rutas con sesión) ─────────────────────────────────────────────────────
// Se usa el id del usuario y no la IP: en la universidad muchos comparten la misma IP.
// Deben ponerse DESPUÉS de `autenticar`, que es quien deja `req.usuario`.
function crearLimiterPorUsuario({ windowMs, max, mensaje }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.usuario?.id || req.ip,
    message: {
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: mensaje },
    },
  });
}

// votar y guardar: se usan mucho al recorrer el feed
const interaccionLimiter = crearLimiterPorUsuario({
  windowMs: 60 * 1000,
  max: 120,
  mensaje: 'Estás votando o guardando demasiado rápido. Espera unos segundos.',
});

// crear apuntes y comentarios
const publicacionLimiter = crearLimiterPorUsuario({
  windowMs: 10 * 60 * 1000,
  max: 30,
  mensaje:
    'Has publicado demasiado en poco tiempo. Intenta de nuevo en unos minutos.',
});

// subir archivos (un apunte puede llevar hasta 10)
const subidaLimiter = crearLimiterPorUsuario({
  windowMs: 10 * 60 * 1000,
  max: 60,
  mensaje:
    'Has subido demasiados archivos en poco tiempo. Intenta de nuevo en unos minutos.',
});

// reportes
const reporteLimiter = crearLimiterPorUsuario({
  windowMs: 60 * 60 * 1000,
  max: 20,
  mensaje: 'Has enviado demasiados reportes. Intenta de nuevo más tarde.',
});

export {
  loginLimiter,
  registerLimiter,
  interaccionLimiter,
  publicacionLimiter,
  subidaLimiter,
  reporteLimiter,
};
