import express from 'express';
import { register, login, refresh, logout, me } from './auth.controller.js';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', autenticar, me);

export default router;
