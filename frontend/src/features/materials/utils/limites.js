// Deben coincidir con materials.validation.js y multer.helper.js (backend)
export const TITULO_MIN = 3;
export const TITULO_MAX = 150;
export const DESCRIPCION_MAX = 2000;
export const SNIPPET_MAX = 20000;
export const LINKS_MAX = 5;
export const LINK_MAX = 2048;
export const MAX_ARCHIVOS = 10; // MAX_ARCHIVOS_POR_APUNTE en el backend
export const MAX_TAMANIO_MB = 20;
export const MAX_TAMANIO_BYTES = MAX_TAMANIO_MB * 1024 * 1024;
// Deben coincidir con backend/src/shared/files/fileMime.helper.js
// (EXTENSIONES_PERMITIDAS); apunte no restringe más.
export const ADJUNTOS_EXTENSIONES = [
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
