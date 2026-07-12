import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set reducido: documentos + comprimidos + imágenes + planillas.
// el código va como snippet (texto plano en la BD) y los repos como link de
// GitHub, así que ya no hace falta aceptar .js/.py/.java/etc. como archivo.
// nota: req.body.tipo (apunte/codigo/guia/ejercicio/otro) no se usa hoy desde
// el frontend, así que se dejó una sola lista en vez de una por categoría.
const EXTENSIONES_PERMITIDAS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.zip',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, nombre);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (EXTENSIONES_PERMITIDAS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error(`Extensión ${ext} no permitida`), {
        statusCode: 400,
        code: 'BAD_REQUEST',
      }),
    );
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export { upload };
