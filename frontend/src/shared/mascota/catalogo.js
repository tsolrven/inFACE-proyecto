export const CARRERA_A_ORIGEN = {
  IECI: 'ieci',
  ICINF: 'icinf',
  CPA: 'cpa',
  ICO: 'comercial',
  DER: 'derecho',
};

export const ORIGENES = [
  { id: 'ieci', label: 'Ing. Ejec. Computación' },
  { id: 'icinf', label: 'Ing. Civil en Informática' },
  { id: 'cpa', label: 'Contador Público y Auditor' },
  { id: 'comercial', label: 'Ing. Comercial' },
  { id: 'derecho', label: 'Derecho' },
];

export const ACCESORIOS = [
  {
    id: 'comercial_maletin',
    origen: 'comercial',
    label: 'Maletín',
    slot: 'abajo',
    z: 10,
    bbox: [661, 1063, 972, 1329],
  },
  {
    id: 'ieci_pc',
    origen: 'ieci',
    label: 'Notebook',
    slot: 'abajo',
    z: 11,
    bbox: [562, 835, 990, 1176],
  },
  {
    id: 'cpa_grafico',
    origen: 'cpa',
    label: 'Informe',
    slot: 'mano',
    z: 20,
    bbox: [169, 664, 612, 1026],
  },
  {
    id: 'icinf_celular',
    origen: 'icinf',
    label: 'Celular',
    slot: 'mano',
    z: 21,
    bbox: [376, 724, 492, 957],
  },
  {
    id: 'derecho_martillo',
    origen: 'derecho',
    label: 'Martillo',
    slot: 'mano',
    z: 22,
    bbox: [328, 667, 510, 984],
  },
  {
    id: 'derecho_corbata',
    origen: 'derecho',
    label: 'Corbata negra',
    slot: 'cuello',
    z: 30,
    bbox: [568, 736, 699, 951],
  },
  {
    id: 'icinf_corbata',
    origen: 'icinf',
    label: 'Corbata roja',
    slot: 'cuello',
    z: 31,
    bbox: [568, 736, 699, 951],
  },
  {
    id: 'comercial_boca',
    origen: 'comercial',
    label: 'Sonrisa brillante',
    slot: 'boca',
    z: 40,
    bbox: [479, 569, 774, 750],
  },
  {
    id: 'derecho_lentes',
    origen: 'derecho',
    label: 'Monóculo',
    slot: 'ojos',
    z: 50,
    bbox: [451, 520, 708, 600],
  },
  {
    id: 'icinf_lentes',
    origen: 'icinf',
    label: 'Lentes cuadrados',
    slot: 'ojos',
    z: 51,
    bbox: [436, 484, 897, 597],
  },
  {
    id: 'comercial_gafas',
    origen: 'comercial',
    label: 'Lentes oscuros',
    slot: 'ojos',
    z: 52,
    bbox: [442, 463, 903, 573],
  },
  {
    id: 'cpa_gorra',
    origen: 'cpa',
    label: 'Gorra',
    slot: 'cabeza',
    z: 60,
    bbox: [394, 325, 1032, 522],
  },
  {
    id: 'icinf_antena',
    origen: 'icinf',
    label: 'Antena',
    slot: 'cabeza',
    z: 61,
    bbox: [716, 109, 780, 282],
  },
  {
    id: 'comercial_auricular',
    origen: 'comercial',
    label: 'Auricular',
    slot: 'cabeza',
    z: 62,
    bbox: [769, 472, 972, 648],
  },
  {
    id: 'ieci_audifono',
    origen: 'ieci',
    label: 'Audífonos',
    slot: 'cabeza',
    z: 63,
    bbox: [361, 211, 1029, 845],
  },
];

export const SLOTS = [
  { id: 'cabeza', label: 'Cabeza', icon: 'ti-hat-chef' },
  { id: 'ojos', label: 'Ojos', icon: 'ti-glasses' },
  { id: 'boca', label: 'Boca', icon: 'ti-mood-smile' },
  { id: 'cuello', label: 'Cuello', icon: 'ti-necktie' },
  { id: 'mano', label: 'Mano', icon: 'ti-hand-stop' },
  { id: 'abajo', label: 'Objeto', icon: 'ti-briefcase' },
];

export const CANVAS = { x0: 150, y0: 90, w: 1150, h: 1270 };

export const ACCESORIO_POR_ID = Object.fromEntries(
  ACCESORIOS.map((a) => [a.id, a]),
);

export function accesoriosPorDefecto(codigoCarrera) {
  const origen = CARRERA_A_ORIGEN[codigoCarrera];
  if (!origen) return [];
  return ACCESORIOS.filter((a) => a.origen === origen).map((a) => a.id);
}

export function normalizarAccesorios(ids) {
  const porSlot = new Map();
  for (const id of Array.isArray(ids) ? ids : []) {
    const a = ACCESORIO_POR_ID[id];
    if (a) porSlot.set(a.slot, a);
  }
  return [...porSlot.values()].sort((x, y) => x.z - y.z).map((a) => a.id);
}

export function accesoriosDeUsuario({ avatar, carrera }) {
  if (avatar && Array.isArray(avatar.accesorios)) {
    return normalizarAccesorios(avatar.accesorios);
  }
  return normalizarAccesorios(accesoriosPorDefecto(carrera?.codigo));
}

// ─────────────────────────────────────────────────────────────────────────────
export const CARGOS = [
  { id: 'jefe_carrera', label: 'Jefa de Carrera', color: 'text-amber-300' },
  { id: 'funcionario', label: 'Funcionario', color: 'text-sky-300' },
  { id: 'academico', label: 'Académico', color: 'text-emerald-300' },
];
export const CARGO_POR_ID = Object.fromEntries(CARGOS.map((c) => [c.id, c]));
