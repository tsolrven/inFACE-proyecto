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
  // badge del snippet de código
  codigo: {
    icon: 'ti-code',
    color: '#34D399',
    bg: 'rgba(52,211,153,.1)',
    label: 'Código',
  },
  // adjuntos de texto plano y datos (.txt .md .csv .tsv .json .jsonl .xml .yaml)
  texto: {
    icon: 'ti-file-text',
    color: '#22D3EE',
    bg: 'rgba(34,211,238,.1)',
    label: 'Texto y datos',
  },
  github: {
    icon: 'ti-brand-github',
    color: '#818CF8',
    bg: 'rgba(129,140,248,.1)',
    label: 'GitHub',
  },
  link: {
    icon: 'ti-link',
    color: '#FFFFFF',
    bg: 'rgba(255,255,255,.1)',
    label: 'Link',
  },
  default: {
    icon: 'ti-file',
    color: '#9898A8',
    bg: 'rgba(255,255,255,.05)',
    label: 'Archivo',
  },
};

// `value` debe existir en FILTROS_TIPO_ARCHIVO del backend
// (backend/src/modules/materials/fileType.helper.js)
export const TIPOS_ARCHIVO_FILTRO = [
  {
    value: null,
    ...DEFS.default,
    label: 'Todos los tipos',
    icon: 'ti-stack-2',
  },
  // por archivo adjunto
  { value: 'pdf', ...DEFS.pdf },
  { value: 'doc', ...DEFS.doc },
  { value: 'ppt', ...DEFS.ppt },
  { value: 'excel', ...DEFS.excel },
  { value: 'imagen', ...DEFS.imagen },
  { value: 'zip', ...DEFS.zip },
  { value: 'texto', ...DEFS.texto },
  // por contenido del apunte
  { value: 'snippet', ...DEFS.codigo, label: 'Fragmento de código' },
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
  // igualdad exacta en xml/yaml: los MIME de Office contienen "xml"
  // (openxmlformats), aunque ya se resolvieron arriba
  if (
    mime.startsWith('text/') ||
    mime.includes('json') ||
    mime === 'application/xml' ||
    mime === 'application/yaml'
  )
    return 'texto';
  return 'default';
}

export function metaDeArchivo(archivo) {
  return DEFS[categoriaDeMime(archivo?.tipo_mime)] ?? DEFS.default;
}

// Para ArchivosInput: sirve para archivos ya guardados (tipo_mime) y para los
// File recién elegidos (type).
export function iconoDeAdjunto(archivo) {
  return metaDeArchivo({ tipo_mime: archivo.tipo_mime ?? archivo.type }).icon;
}

const DOMINIOS_LINK = {
  'github.com': DEFS.github,
  'gitlab.com': {
    icon: 'ti-brand-gitlab',
    color: '#F97316',
    bg: 'rgba(249,115,22,.1)',
    label: 'GitLab',
  },
  'youtube.com': {
    icon: 'ti-brand-youtube',
    color: '#F87171',
    bg: 'rgba(248,113,113,.1)',
    label: 'YouTube',
  },
  'youtu.be': {
    icon: 'ti-brand-youtube',
    color: '#F87171',
    bg: 'rgba(248,113,113,.1)',
    label: 'YouTube',
  },
  'drive.google.com': {
    icon: 'ti-brand-google-drive',
    color: '#4ADE80',
    bg: 'rgba(74,222,128,.1)',
    label: 'Drive',
  },
  'docs.google.com': {
    icon: 'ti-file-text',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,.1)',
    label: 'Google Docs',
  },
  'colab.research.google.com': { ...DEFS.codigo, label: 'Colab' },
  'figma.com': {
    icon: 'ti-brand-figma',
    color: '#F472B6',
    bg: 'rgba(244,114,182,.1)',
    label: 'Figma',
  },
  'notion.so': {
    icon: 'ti-brand-notion',
    color: '#E0C9A6',
    bg: 'rgba(224,201,166,.1)',
    label: 'Notion',
  },
};

export function metaDeLink(url) {
  if (esLinkGithub(url)) return DEFS.github; // incluye subdominios (gist)
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return DOMINIOS_LINK[host] ?? DEFS.link;
  } catch {
    return DEFS.link;
  }
}

// '#RRGGBB' -> 'rgba(r,g,b,alfa)'
function conAlfa(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

// colores de la caja del link (tarjeta y detalle): cada dominio usa su propio
// color en borde, fondo y texto; sale del mismo meta que el ícono
export function estiloDeLink(url) {
  const { color } = metaDeLink(url);
  return {
    color,
    bg: conAlfa(color, 0.05),
    border: conAlfa(color, 0.18),
  };
}

export function metaDeBadge(value) {
  return DEFS[value] ?? null;
}

export const BADGE_POR_DEFECTO = DEFS.default;

export function metaPrincipal(apunte) {
  if (apunte.links?.[0]) return metaDeLink(apunte.links[0]);
  if (apunte.codigo_snippet) return DEFS.codigo;
  if (apunte.archivos?.[0]) return metaDeArchivo(apunte.archivos[0]);
  return DEFS.default;
}

const ORDEN_BADGES = [
  'pdf',
  'doc',
  'ppt',
  'excel',
  'zip',
  'imagen',
  'texto',
  'codigo',
  'github',
];

// mismo criterio que REGEX_LINK_GITHUB en
// backend/src/modules/materials/materials.service.js:
// http(s) y host github.com o un subdominio (gist.github.com, www.github.com)
function esLinkGithub(url) {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    return hostname === 'github.com' || hostname.endsWith('.github.com');
  } catch {
    return false;
  }
}

// badges que se muestran sobre el post: siempre derivados del contenido real
export function badgesDeApunte({
  archivos = [],
  links = [],
  codigo_snippet,
} = {}) {
  const presentes = new Set();
  for (const a of archivos) {
    const categoria = categoriaDeMime(a.tipo_mime);
    if (categoria !== 'default') presentes.add(categoria);
  }
  if (codigo_snippet?.trim()) presentes.add('codigo');
  if (links.some(esLinkGithub)) presentes.add('github');
  return ORDEN_BADGES.filter((b) => presentes.has(b)); // orden estable
}