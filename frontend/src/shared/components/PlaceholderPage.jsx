//! si una sección del sidebar todavía no tiene su funcionalidad real implementada, se usa este componente para que la ruta exista
//! cuando se implemente la página de verdad, se reemplaza el contenido de su archivo en src/pages/... y se deja de usar este componente

export default function PlaceholderPage({ title, description }) {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='text-center select-none'>
        <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
        <h1 className='text-base font-semibold text-neutral-300'>{title}</h1>
        <p className='mt-1.5 text-sm text-neutral-500'>
          {description || 'Esta sección todavía no está implementada.'}
        </p>
      </div>
    </div>
  );
}
