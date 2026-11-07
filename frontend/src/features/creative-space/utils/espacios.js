export const ESPACIOS = [
  {
    id: 'artes-visuales',
    label: 'Artes visuales',
    icono: 'ti-photo',
    color: '#fb923c',
    tipos: ['visual'],
    crear: ['visual'],
    descripcion: 'Galerías de arte y fotos únicas, como álbumes de fotos.',
    botonCrear: 'Subir arte',
  },
  {
    id: 'escritura',
    label: 'Escritura',
    icono: 'ti-feather',
    color: '#60a5fa',
    tipos: ['poema', 'historia', 'guion'],
    crear: ['poema', 'historia', 'guion'],
    descripcion: 'Poemas, historias y obras de teatro.',
    botonCrear: 'Escribir',
  },
  {
    id: 'audiovisual',
    label: 'Audiovisual',
    icono: 'ti-movie',
    color: '#a78bfa',
    tipos: ['audiovisual'],
    crear: ['audiovisual'],
    descripcion: 'Cortos, obras de teatro filmadas, videos con su elenco.',
    botonCrear: 'Publicar audiovisual',
  },
  {
    id: 'musica',
    label: 'Música',
    icono: 'ti-music',
    color: '#f472b6',
    tipos: ['musica', 'album'],
    crear: ['musica'],
    descripcion: 'Canciones sueltas y álbumes, con portada y reproductor.',
    botonCrear: 'Subir música',
  },
];

export const ESPACIO_POR_ID = Object.fromEntries(
  ESPACIOS.map((e) => [e.id, e]),
);

export const ESPACIO_DE_TIPO = Object.fromEntries(
  ESPACIOS.flatMap((e) => e.tipos.map((t) => [t, e])),
);

export const rutas = {
  inicio: '/espacio-creativo',
  espacio: (id) => `/espacio-creativo/${id}`,
  obra: (id) => `/espacio-creativo/obra/${id}`,
  editar: (id) => `/espacio-creativo/obra/${id}/editar`,
  nueva: (tipo, espacio) =>
    tipo
      ? `/espacio-creativo/nueva?tipo=${tipo}`
      : espacio
        ? `/espacio-creativo/nueva?espacio=${espacio}`
        : '/espacio-creativo/nueva',
  hashtag: (nombre) =>
    `/espacio-creativo/hashtag/${encodeURIComponent(nombre)}`,
};
