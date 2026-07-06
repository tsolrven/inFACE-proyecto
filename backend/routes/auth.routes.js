import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', autenticar, me);

export default router;
