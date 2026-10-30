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
  link: {
    icon: 'ti-link',
    color: '#818CF8',
    bg: 'rgba(129,140,248,.1)',
    label: 'Link',
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

const DOMINIOS_LINK = {
  'github.com': DEFS.github,
  'gitlab.com': { ...DEFS.link, icon: 'ti-brand-gitlab', label: 'GitLab' },
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
    color: '#E5E5E5',
    bg: 'rgba(229,229,229,.1)',
    label: 'Notion',
  },
};

export function metaDeLink(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return DOMINIOS_LINK[host] ?? DEFS.link;
  } catch {
    return DEFS.link;
  }
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
  'codigo',
  'github',
];

function esLinkGithub(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '') === 'github.com';
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
