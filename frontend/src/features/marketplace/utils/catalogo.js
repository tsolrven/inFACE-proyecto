export const CATEGORIAS = [
  { id: 'libros', label: 'Libros y apuntes', icono: 'ti-book' },
  { id: 'tecnologia', label: 'Tecnología', icono: 'ti-device-laptop' },
  { id: 'hogar', label: 'Hogar y muebles', icono: 'ti-armchair' },
  { id: 'ropa', label: 'Ropa y accesorios', icono: 'ti-shirt' },
  { id: 'deporte', label: 'Deportes', icono: 'ti-ball-football' },
  { id: 'servicios', label: 'Servicios y clases', icono: 'ti-tools' },
  { id: 'otros', label: 'Otros', icono: 'ti-package' },
];
export const CATEGORIA_POR_ID = Object.fromEntries(
  CATEGORIAS.map((c) => [c.id, c]),
);

export const CONDICIONES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'como_nuevo', label: 'Como nuevo' },
  { id: 'usado', label: 'Usado' },
  { id: 'para_reparar', label: 'Para reparar' },
];
export const CONDICION_POR_ID = Object.fromEntries([
  ...CONDICIONES.map((c) => [c.id, c]),
  ['servicio', { id: 'servicio', label: 'Servicio' }],
]);

export const esServicio = (categoria) => categoria === 'servicios';

export const UNIDADES_PRECIO = [
  { id: 'hora', label: 'Por hora' },
  { id: 'clase', label: 'Por clase' },
  { id: 'proyecto', label: 'Por proyecto' },
  { id: 'total', label: 'Precio total' },
];
export const UNIDAD_POR_ID = Object.fromEntries(
  UNIDADES_PRECIO.map((u) => [u.id, u]),
);

export const MODALIDADES = [
  { id: 'presencial', label: 'Presencial', icono: 'ti-school' },
  { id: 'online', label: 'Online', icono: 'ti-wifi' },
  { id: 'ambas', label: 'Presencial y online', icono: 'ti-users' },
];
export const MODALIDAD_POR_ID = Object.fromEntries(
  MODALIDADES.map((m) => [m.id, m]),
);

export const ESTADOS = [
  {
    id: 'disponible',
    label: 'Disponible',
    icono: 'ti-circle-check',
    clases: 'bg-emerald-400/15 text-emerald-300',
  },
  {
    id: 'reservado',
    label: 'Reservado',
    icono: 'ti-clock',
    clases: 'bg-amber-400/15 text-amber-300',
  },
  {
    id: 'vendido',
    label: 'Vendido',
    icono: 'ti-hand-stop',
    clases: 'bg-neutral-500/20 text-neutral-400',
  },
];
export const ESTADO_POR_ID = Object.fromEntries(ESTADOS.map((e) => [e.id, e]));

export const ORDENES = [
  { valor: 'recientes', label: 'Más recientes' },
  { valor: 'precio_asc', label: 'Precio: menor a mayor' },
  { valor: 'precio_desc', label: 'Precio: mayor a menor' },
];

export const FILTROS_INICIALES = {
  categoria: null,
  condicion: '',
  estado: 'disponible',
  orden: 'recientes',
  precio_min: '',
  precio_max: '',
  busqueda: '',
};

export const TITULO_MIN = 3;
export const TITULO_MAX = 100;
export const DESCRIPCION_MAX = 2000;
export const PRECIO_MAX = 99_999_999;
export const FOTOS_MAX = 8;
export const FOTO_MAX_MB = 10;
export const FOTOS_EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const formatoCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});
export const formatearPrecio = (precio) =>
  precio === 0 ? 'Gratis' : formatoCLP.format(precio);

export function textoPrecio(producto) {
  const base = formatearPrecio(producto.precio);
  if (!esServicio(producto.categoria) || producto.precio === 0) return base;
  const unidad = {
    hora: 'hora',
    clase: 'clase',
    proyecto: 'proyecto',
  }[producto.unidad_precio];
  return unidad ? `${base} / ${unidad}` : base;
}

export const soloDigitos = (texto) => String(texto ?? '').replace(/\D/g, '');
export const conPuntos = (texto) =>
  soloDigitos(texto)
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const enlaceWhatsapp = (numero, titulo) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(
    `Hola! Vi tu publicación "${titulo}" en el Marketplace de inFACE. ¿Sigue disponible?`,
  )}`;

export const enlaceInstagram = (usuario) =>
  `https://www.instagram.com/${usuario}/`;

export function mostrarWhatsapp(numero) {
  const m = /^56(9)(\d{4})(\d{4})$/.exec(numero ?? '');
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : `+${numero}`;
}

export const rutas = {
  inicio: '/marketplace',
  nuevo: '/marketplace/nuevo',
  producto: (id) => `/marketplace/producto/${id}`,
  editar: (id) => `/marketplace/producto/${id}/editar`,
};