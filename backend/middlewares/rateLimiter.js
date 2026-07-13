//! rate limiting para rutas sensibles (protege contra fuerza bruta y credential stuffing)

import rateLimit from 'express-rate-limit';

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
      message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.',
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

export { loginLimiter, registerLimiter };
