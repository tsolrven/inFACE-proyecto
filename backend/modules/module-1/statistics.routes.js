import express from 'express';
import {
  topColaboradores,
  hashtagsPopulares,
} from './statistics.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/top-colaboradores', autenticar, topColaboradores);
router.get('/hashtags-populares', autenticar, hashtagsPopulares);

export default router;
