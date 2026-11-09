import { CANVAS } from './catalogo';

export default function Miniatura({ accesorio, tam = 64 }) {
  const [x0, y0, x1, y1] = accesorio.bbox;
  const escala = (tam * 0.78) / Math.max(x1 - x0, y1 - y0);
  const left = tam / 2 - ((x0 + x1) / 2 - CANVAS.x0) * escala;
  const top = tam / 2 - ((y0 + y1) / 2 - CANVAS.y0) * escala;

  return (
    <div
      className='relative overflow-hidden'
      style={{ width: tam, height: tam }}
    >
      <img
        src={`/mascota/${accesorio.id}.png`}
        alt=''
        draggable={false}
        className='pointer-events-none absolute max-w-none select-none'
        style={{
          width: CANVAS.w * escala,
          height: CANVAS.h * escala,
          left,
          top,
        }}
      />
    </div>
  );
}
