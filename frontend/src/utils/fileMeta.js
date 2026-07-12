//! traduce un mimetype (el tipo_archivo del filtro) a { icon, color, bg, label }.

const DEFS = {
  pdf: {
    icon: 'ti-file-type-pdf',
    color: '#E8546A',
    bg: 'rgba(232,84,106,.1)',
    label: 'PDF',
  },
  imagen: {
    icon: 'ti-photo',
    color: '#FBBF24',
    bg: 'rgba(251,191,36,.1)',
    label: 'Imagen',
  },
  doc: {
    icon: 'ti-file-type-doc',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,.1)',
    label: 'Word / Doc',
  },
  ppt: {
    icon: 'ti-presentation',
    color: '#FB923C',
    bg: 'rgba(251,146,60,.1)',
    label: 'Presentación',
  },
  zip: {
    icon: 'ti-file-zip',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,.1)',
    label: 'Comprimido',
  },
  excel: {
    icon: 'ti-file-type-xls',
    color: '#4ADE80',
    bg: 'rgba(74,222,128,.1)',
    label: 'Excel',
  },
  codigo: {
    icon: 'ti-code',
    color: '#34D399',
    bg: 'rgba(52,211,153,.1)',
    label: 'Código',
  },
  github: {
    icon: 'ti-brand-github',
    color: '#818CF8',
    bg: 'rgba(129,140,248,.1)',
    label: 'GitHub',
  },
  default: {
    icon: 'ti-file',
    color: '#9898A8',
    bg: 'rgba(255,255,255,.05)',
    label: 'Archivo',
  },
};

export const TIPOS_ARCHIVO_FILTRO = [
  {
    value: null,
    ...DEFS.default,
    label: 'Todos los tipos',
    icon: 'ti-stack-2',
  },
  { value: 'pdf', ...DEFS.pdf },
  { value: 'codigo', ...DEFS.codigo, label: 'Código / GitHub' },
  { value: 'ppt', ...DEFS.ppt },
  { value: 'doc', ...DEFS.doc },
  { value: 'imagen', ...DEFS.imagen },
  { value: 'zip', ...DEFS.zip },
  { value: 'excel', ...DEFS.excel },
];

// catálogo de badges que el usuario puede marcar manualmente al subir/editar
// un apunte (selector tipo "chips"). Controla solo el badge principal que se
// muestra arriba del post; no reemplaza el ícono automático de cada archivo
// individual en la lista de adjuntos (ese sigue viniendo de metaDeArchivo()).
export const BADGES_SELECCIONABLES = [
  { value: 'pdf', ...DEFS.pdf },
  { value: 'doc', ...DEFS.doc },
  { value: 'ppt', ...DEFS.ppt },
  { value: 'excel', ...DEFS.excel },
  { value: 'zip', ...DEFS.zip },
  { value: 'imagen', ...DEFS.imagen },
  { value: 'codigo', ...DEFS.codigo },
  { value: 'github', ...DEFS.github },
];

function categoriaDeMime(mime = '') {
  if (mime.startsWith('application/pdf')) return 'pdf';
  if (mime.startsWith('image/')) return 'imagen';
  if (mime.includes('msword') || mime.includes('wordprocessingml'))
    return 'doc';
  if (mime.includes('ms-powerpoint') || mime.includes('presentationml'))
    return 'ppt';
  if (mime.includes('ms-excel') || mime.includes('spreadsheetml'))
    return 'excel';
  if (mime.includes('zip') || mime.includes('rar')) return 'zip';
  if (
    mime.startsWith('text/') ||
    mime.includes('json') ||
    mime.includes('javascript')
  )
    return 'codigo';
  return 'default';
}

export function metaDeArchivo(archivo) {
  return DEFS[categoriaDeMime(archivo?.tipo_mime)] ?? DEFS.default;
}

// devuelve { icon, color, bg, label } para un badge elegido por el usuario
// (apunte.etiquetas_visuales), o null si el value no está en el catálogo
export function metaDeBadge(value) {
  return DEFS[value] ?? null;
}

// ícono genérico para cuando el apunte no tiene ningún badge marcado
export const BADGE_POR_DEFECTO = DEFS.default;

export function metaPrincipal(apunte) {
  if (apunte.link_repositorio) return DEFS.github;
  if (apunte.codigo_snippet) return DEFS.codigo;
  if (apunte.archivos?.[0]) return metaDeArchivo(apunte.archivos[0]);
  return DEFS.default;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// ya no sirve para descargar directamente (los /uploads dejaron de ser públicos).
// para descargar un archivo usar descargarArchivo() del archivo.service, que pasa por el endpoint autenticado.
// dejo esto por si se necesita construir la URL "cruda" para otro propósito
export function urlArchivo(archivo) {
  return `${SERVER_ORIGIN}${archivo.ruta_url}`;
}

export function formatearTamanio(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
