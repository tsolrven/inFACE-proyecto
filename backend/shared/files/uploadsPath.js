import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// por defecto: backend/uploads (dos niveles arriba de shared/files)
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '..', '..', 'uploads');

// ruta_url viene de la BD ("/uploads/123.pdf"); basename evita path traversal
export function resolverRutaFisica(ruta_url) {
  return path.join(UPLOADS_DIR, path.basename(ruta_url));
}
