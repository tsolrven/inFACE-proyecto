//! filtros por tipo del repositorio (los usa listarApuntes - materials.service)
//! - MIME_MAP: categorías que se resuelven por prefijo de tipo_mime de los adjuntos.
//!   tipo_mime lo asigna el servidor según la extensión (fileMime.helper.js).
//! - FILTROS_CONTENIDO: categorías que se resuelven por campos del apunte.
//! El parámetro se sigue llamando `tipo_archivo` aunque incluya «snippet» y
//! «github»: renombrarlo toca varios archivos y no aporta nada funcional.

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
  zip: ['application/zip', 'application/x-zip-compressed'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml',
  ],
  // .txt .md .csv .tsv (text/*), .json, .jsonl, .xml, .yaml/.yml
  texto: [
    'text/',
    'application/json',
    'application/x-ndjson',
    'application/xml',
    'application/yaml',
  ],
};

const FILTROS_CONTENIDO = ['snippet', 'github'];

const FILTROS_TIPO_ARCHIVO = [...Object.keys(MIME_MAP), ...FILTROS_CONTENIDO];

export { MIME_MAP, FILTROS_CONTENIDO, FILTROS_TIPO_ARCHIVO };