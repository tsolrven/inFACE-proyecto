import { segmentosResaltados } from '@/shared/lib/texto';

// Nombre con las partes que coinciden con la búsqueda resaltadas (compara sin
// tildes, muestra el texto original)
export default function NombreResaltado({ nombre, palabras }) {
  return segmentosResaltados(nombre, palabras).map((s, i) =>
    s.resaltado ? (
      <mark
        key={i}
        className='bg-transparent font-semibold text-neutral-100'
      >
        {s.texto}
      </mark>
    ) : (
      <span key={i}>{s.texto}</span>
    ),
  );
}