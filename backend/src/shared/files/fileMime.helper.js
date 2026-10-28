import path from 'path';

const MIME_POR_EXTENSION = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.zip': 'application/zip',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const EXTENSIONES_PERMITIDAS = Object.keys(MIME_POR_EXTENSION);

function obtenerMimePorExtension(nombreArchivo) {
  const extension = path.extname(nombreArchivo).toLowerCase();

  return MIME_POR_EXTENSION[extension] ?? null;
}

export { obtenerMimePorExtension, EXTENSIONES_PERMITIDAS };
