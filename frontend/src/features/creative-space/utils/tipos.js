export const TIPOS_OBRA = [
  {
    id: 'musica',
    label: 'Canción',
    icono: 'ti-music',
    color: '#f472b6',
    ayuda: 'Canciones, covers, composiciones. Sube un audio o pega un enlace.',
    etiquetaSelector: 'Música',
    ayudaSelector:
      'Una canción suelta o un álbum con varias canciones, con portada.',
  },
  {
    id: 'album',
    label: 'Álbum',
    icono: 'ti-disc',
    color: '#f472b6',
    ayuda: 'Varias canciones juntas, con portada. Cada pista: audio o enlace.',
  },
  {
    id: 'visual',
    label: 'Artes visuales',
    icono: 'ti-palette',
    color: '#fb923c',
    ayuda: 'Dibujo, pintura, fotografía, diseño. Sube tus imágenes.',
  },
  {
    id: 'audiovisual',
    label: 'Audiovisual',
    icono: 'ti-movie',
    color: '#a78bfa',
    ayuda:
      'Obras de teatro, cortos, videos. Pega el enlace de YouTube o Vimeo.',
  },
  {
    id: 'poema',
    label: 'Poema',
    icono: 'ti-feather',
    color: '#60a5fa',
    ayuda: 'Versos con la fuente que quieras, firma e imagen de fondo.',
  },
  {
    id: 'historia',
    label: 'Historia',
    icono: 'ti-books',
    color: '#38bdf8',
    ayuda:
      'Cuentos y novelas por capítulos, con portada y comentarios por párrafo.',
  },
  {
    id: 'guion',
    label: 'Obra de teatro',
    icono: 'ti-book-2',
    color: '#34d399',
    ayuda: 'Guion con personajes (con imagen) y diálogos por capítulo.',
  },
];

export const TIPO_POR_ID = Object.fromEntries(TIPOS_OBRA.map((t) => [t.id, t]));

export function textosForm(tipo, esGaleria = false) {
  const t = {
    visual: esGaleria
      ? { titulo: 'Nueva galería', publicar: 'Publicar galería' }
      : { titulo: 'Nueva foto', publicar: 'Publicar foto' },
    poema: { titulo: 'Nuevo poema', publicar: 'Publicar poema' },
    historia: { titulo: 'Nueva historia', publicar: 'Publicar historia' },
    guion: { titulo: 'Nueva obra de teatro', publicar: 'Publicar obra' },
    audiovisual: { titulo: 'Nuevo audiovisual', publicar: 'Publicar' },
    musica: { titulo: 'Nueva canción', publicar: 'Publicar canción' },
    album: { titulo: 'Nuevo álbum', publicar: 'Publicar álbum' },
  };
  return t[tipo] ?? { titulo: 'Nueva creación', publicar: 'Publicar' };
}
