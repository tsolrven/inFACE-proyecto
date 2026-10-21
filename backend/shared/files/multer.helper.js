import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from './uploadsPath.js';
import { BadRequestError } from '../../errors/appError.js';
import { obtenerConfigAdjuntos } from '../content/contentRegistry.js';
import { EXTENSIONES_PERMITIDAS } from './fileMime.helper.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR))
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, nombre);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  // si el tipo restringe extensiones, se aplica sobre la lista general
  // (nunca puede ampliarla)
  const tipo = req.tipoContenido ?? req.params.tipo; 
  const { extensiones } = obtenerConfigAdjuntos(tipo); 
  const permitidas = extensiones
    ? EXTENSIONES_PERMITIDAS.filter((e) => extensiones.includes(e))
    : EXTENSIONES_PERMITIDAS;

  if (permitidas.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Extensión ${ext} no permitida`));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
  defParamCharset: 'utf8',
});

export { upload };
