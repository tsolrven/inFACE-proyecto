import { navSections } from '@/shared/config/navigation';
import { rutas as rutasMarketplace } from '@/features/marketplace/utils/catalogo';
import { rutas as rutasCreativo } from '@/features/creative-space/utils/espacios';

// Accesos (tarjetas) y atajos (píldoras) del héroe, por rol base.

const MATCH = {
  to: '/match-proyectos',
  icon: 'ti-puzzle',
  titulo: 'Match de proyectos',
  texto: 'Encuentra equipo',
  color: 'text-pink-400',
  fondo: 'bg-pink-500/10 border-pink-500/25',
};
const CREATIVO = {
  to: '/espacio-creativo',
  icon: 'ti-palette',
  titulo: 'Espacio creativo',
  texto: 'Muestra tu arte',
  color: 'text-violet-400',
  fondo: 'bg-violet-400/10 border-violet-400/25',
};
const MARKETPLACE = {
  to: '/marketplace',
  icon: 'ti-shopping-bag',
  titulo: 'Marketplace',
  texto: 'Compra y vende',
  color: 'text-amber-400',
  fondo: 'bg-amber-400/10 border-amber-400/25',
};

export const ACCESOS_ESTUDIANTE = [
  {
    to: '/foro-por-ramos',
    icon: 'ti-messages',
    titulo: 'Foro por ramos',
    texto: 'Pregunta y responde',
    color: 'text-emerald-400',
    fondo: 'bg-emerald-400/10 border-emerald-400/25',
  },
  {
    to: '/repositorio-materiales',
    icon: 'ti-books',
    titulo: 'Materiales',
    texto: 'Apuntes por ramo',
    color: 'text-blue-400',
    fondo: 'bg-blue-400/10 border-blue-400/25',
  },
  {
    to: '/anuncios-oficiales',
    icon: 'ti-speakerphone',
    titulo: 'Anuncios',
    texto: 'Avisos de tu carrera',
    color: 'text-amber-400',
    fondo: 'bg-amber-400/10 border-amber-400/25',
  },
  MATCH,
  CREATIVO,
  MARKETPLACE,
];

// el docente entra a lo académico por las comunidades: sus accesos son ellas
// (salen del menú, así no se duplica la lista de carreras)
const COMUNIDADES =
  navSections.find((s) => s.title === 'Comunidades')?.items ?? [];

export const ACCESOS_DOCENTE = COMUNIDADES.map((c) => ({
  to: c.path,
  icon: c.icon ?? 'ti-building',
  titulo: c.label,
  texto: 'Foro y materiales',
  color: 'text-sky-400',
  fondo: 'bg-sky-400/10 border-sky-400/25',
}));

const ACCIONES_COMUNES = [
  {
    to: '/match-proyectos?tab=mis&crear=1',
    icon: 'ti-plus',
    label: 'Publicar proyecto',
  },
  { to: rutasCreativo.nueva(), icon: 'ti-brush', label: 'Crear obra' },
  { to: rutasMarketplace.nuevo, icon: 'ti-tag', label: 'Vender algo' },
];

export const ACCIONES_ESTUDIANTE = [
  {
    to: '/foro-por-ramos?crear=hilo',
    icon: 'ti-message-question',
    label: 'Preguntar en el foro',
  },
  {
    to: '/repositorio-materiales?subir=1',
    icon: 'ti-upload',
    label: 'Subir apunte',
  },
  ...ACCIONES_COMUNES,
];

export const ACCIONES_DOCENTE = ACCIONES_COMUNES;