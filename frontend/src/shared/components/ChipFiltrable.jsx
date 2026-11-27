// Chip de una tarjeta (ramo, estado, tipo) que en el feed filtra por su valor;
// un segundo clic con ese filtro activo lo quita. Sin `onFiltrar` es solo una
// etiqueta, como en guardados, el perfil o el detalle.
export default function ChipFiltrable({
  onFiltrar,
  activo = false,
  titulo,
  className = '',
  style,
  children,
}) {
  if (!onFiltrar) {
    return (
      <span
        className={className}
        style={style}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type='button'
      onClick={(e) => {
        e.stopPropagation();
        onFiltrar();
      }}
      aria-pressed={activo}
      title={activo ? 'Quitar filtro' : titulo}
      className={`${className} transition-shadow hover:ring-1 hover:ring-current/40 ${activo ? 'ring-1 ring-current/60' : ''}`}
      style={style}
    >
      {children}
    </button>
  );
}