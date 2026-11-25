import { rutas as rutasMarketplace } from '@/features/marketplace/utils/catalogo';
import { rutas as rutasCreativo } from '@/features/creative-space/utils/espacios';

// Accesos (tarjetas) y atajos (píldoras) del héroe. En la parte 3 se agregan
// las variantes por rol.
export const ACCESOS_ESTUDIANTE = [
  {
    to: '/match-proyectos',
    icon: 'ti-puzzle',
    titulo: 'Match de proyectos',
    texto: 'Encuentra equipo',
    color: 'text-pink-400',
    fondo: 'bg-pink-500/10 border-pink-500/25',
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
    to: '/espacio-creativo',
    icon: 'ti-palette',
    titulo: 'Espacio creativo',
    texto: 'Muestra tu arte',
    color: 'text-violet-400',
    fondo: 'bg-violet-400/10 border-violet-400/25',
  },
  {
    to: '/marketplace',
    icon: 'ti-shopping-bag',
    titulo: 'Marketplace',
    texto: 'Compra y vende',
    color: 'text-amber-400',
    fondo: 'bg-amber-400/10 border-amber-400/25',
  },
];

export const ACCIONES_ESTUDIANTE = [
  {
    to: '/match-proyectos?tab=mis',
    icon: 'ti-plus',
    label: 'Publicar proyecto',
  },
  { to: '/repositorio-materiales', icon: 'ti-upload', label: 'Subir apunte' },
  { to: rutasCreativo.nueva(), icon: 'ti-brush', label: 'Crear obra' },
  { to: rutasMarketplace.nuevo, icon: 'ti-tag', label: 'Vender algo' },
];