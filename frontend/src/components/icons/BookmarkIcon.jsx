//! ícono de bookmark que sí soporta un estado "relleno" de verdad.
//! El CDN de íconos de este proyecto (@tabler/icons-webfont) solo trae variantes
//! outline — cualquier clase "-filled" no dibuja nada. Para el estado "guardado"
//! (que sí necesita verse relleno, no solo cambiar de color) se usa un SVG propio
//! en vez de depender del CDN.

export default function BookmarkIcon({ filled = false, className = '' }) {
  if (!filled) {
    return <i className={`ti ti-bookmark ${className}`} />;
  }

  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      className={`inline-block align-[-0.125em] ${className}`}
      aria-hidden='true'
    >
      <path d='M17 3H7a2 2 0 0 0-2 2v16l7-3.5 7 3.5V5a2 2 0 0 0-2-2z' />
    </svg>
  );
}
