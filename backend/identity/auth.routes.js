import express from 'express';
import { register, login, refresh, logout, me, aceptarTerminosController } from './auth.controller.js';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema, aceptarTerminosSchema } from './auth.validation.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', autenticar, me);
router.post('/aceptar-terminos', autenticar, validate(aceptarTerminosSchema), aceptarTerminosController);
export default router;
