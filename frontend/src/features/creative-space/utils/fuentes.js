export const FUENTES = [
  {
    id: 'lora',
    label: 'Lora (clásica)',
    familia: "'Lora', serif",
    google: 'Lora:ital,wght@0,400;0,600;1,400',
  },
  {
    id: 'playfair',
    label: 'Playfair Display (elegante)',
    familia: "'Playfair Display', serif",
    google: 'Playfair+Display:ital,wght@0,400;0,600;1,400',
  },
  {
    id: 'cormorant',
    label: 'Cormorant Garamond (fina)',
    familia: "'Cormorant Garamond', serif",
    google: 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
  },
  {
    id: 'dancing',
    label: 'Dancing Script (cursiva)',
    familia: "'Dancing Script', cursive",
    google: 'Dancing+Script:wght@400;600',
  },
  {
    id: 'caveat',
    label: 'Caveat (a mano)',
    familia: "'Caveat', cursive",
    google: 'Caveat:wght@400;600',
  },
  {
    id: 'special',
    label: 'Special Elite (máquina de escribir)',
    familia: "'Special Elite', monospace",
    google: 'Special+Elite',
  },
];

export const FUENTE_POR_ID = Object.fromEntries(FUENTES.map((f) => [f.id, f]));
export const ESTILO_POEMA_INICIAL = { fuente: 'lora', alineacion: 'centro' };

const cargadas = new Set();

export function cargarFuente(id) {
  const f = FUENTE_POR_ID[id];
  if (!f || cargadas.has(id) || typeof document === 'undefined') return;
  cargadas.add(id);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
  document.head.appendChild(link);
}

export function familiaDe(id) {
  return (FUENTE_POR_ID[id] ?? FUENTE_POR_ID.lora).familia;
}
