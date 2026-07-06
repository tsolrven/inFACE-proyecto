// mapea las categorías del filtro a prefijos de mimetype (lo utilizo en listarApuntes - apunte.service)

const MIME_MAP = {
  pdf: ['application/pdf'],
  imagen: ['image/'],
  doc: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml',
  ],
  ppt: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml',
  ],
  zip: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
  ],
  codigo: ['text/', 'application/json', 'application/javascript'],
};

export { MIME_MAP };
