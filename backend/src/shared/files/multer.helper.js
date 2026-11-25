import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from './uploadsPath.js';
import { BadRequestError } from '../../errors/appError.js';
import { obtenerConfigAdjuntos } from '../content/contentRegistry.js';
import { EXTENSIONES_PERMITIDAS } from './fileMime.helper.js';

// La parte numérica del nombre nunca se repite ni retrocede dentro del proceso.
// Date.now() solo no basta: varios archivos de una misma petición pueden llegar
// en el mismo milisegundo, y entonces el orden quedaría decidido por el azar.
let ultimaMarca = 0;
function marcaDeTiempo() {
  ultimaMarca = Math.max(Date.now(), ultimaMarca + 1);
  return ultimaMarca;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR))
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nombre = `${marcaDeTiempo()}-${Math.round(Math.random() * 1e9)}${ext}`;
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

const LIMITE_GENERAL = 20 * 1024 * 1024;

function crearUpload(fileSize) {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize },
    defParamCharset: 'utf8',
  });
}

const upload = crearUpload(LIMITE_GENERAL);

function subirUnoPara(tipo, campo) {
  const { maxBytes = LIMITE_GENERAL } = obtenerConfigAdjuntos(tipo);
  const recibir = crearUpload(maxBytes).single(campo);
  return (req, res, next) =>
    recibir(req, res, (err) => {
      if (err?.code === 'LIMIT_FILE_SIZE') {
        return next(
          new BadRequestError(
            `El archivo supera el tamaño máximo permitido (${maxBytes / (1024 * 1024)} MB)`,
          ),
        );
      }
      next(err);
    });
}

export { upload, subirUnoPara };
