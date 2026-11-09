import { accesoriosDeUsuario } from './catalogo';

export default function Mascota({
  avatar,
  carrera,
  accesorios,
  cara = false,
  className = '',
  alt = 'Personaje',
}) {
  const ids = accesorios ?? accesoriosDeUsuario({ avatar, carrera });

  const capas = ['base', ...ids];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: cara ? '1 / 1' : '520 / 574' }}
      role='img'
      aria-label={alt}
    >
      <div
        className={cara ? 'absolute' : 'relative'}
        style={
          cara
            ? 
              { width: '135%', left: '-10%', top: '3%' }
            : { width: '100%' }
        }
      >
        <div
          className='relative w-full'
          style={{ aspectRatio: '520 / 574' }}
        >
          {capas.map((id) => (
            <img
              key={id}
              src={`/mascota/${id}.png`}
              alt=''
              draggable={false}
              className='pointer-events-none absolute inset-0 h-full w-full select-none'
            />
          ))}
        </div>
      </div>
    </div>
  );
}
