import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-center'>
      <i className='ti ti-error-404 text-6xl text-pink-500' />
      <h1 className='text-xl font-semibold text-white'>Página no encontrada</h1>
      <p className='text-sm text-neutral-400'>
        La dirección que buscas no existe o fue movida.
      </p>
      <Link
        to='/'
        className='rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600'
      >
        Volver al inicio
      </Link>
    </div>
  );
}
