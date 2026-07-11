import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIPOS_PERMITIDOS = {
  apunte: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
  codigo: [
    '.js',
    '.py',
    '.java',
    '.c',
    '.cpp',
    '.cs',
    '.ts',
    '.html',
    '.css',
    '.zip',
  ],
  guia: ['.pdf', '.doc', '.docx', '.txt'],
  ejercicio: ['.pdf', '.doc', '.docx', '.zip'],
  otro: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip'],
};

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
  const tipo = req.body.tipo || 'otro';
  const ext = path.extname(file.originalname).toLowerCase();
  const permitidos = TIPOS_PERMITIDOS[tipo] ?? TIPOS_PERMITIDOS.otro;

  if (permitidos.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(
        new Error(`Extensión ${ext} no permitida para tipo "${tipo}"`),
        { statusCode: 400, code: 'BAD_REQUEST' },
      ),
    );
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, 
});

export { upload };
