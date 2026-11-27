import { useCompartir } from '@/shared/post/share/useCompartir';

const CLASES_POR_DEFECTO =
  'flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200';

// Botón "Compartir" (la lógica está en useCompartir)
export default function BotonCompartir({
  path,
  titulo,
  texto,
  vistaPrevia,
  className,
}) {
  const { compartir, modal } = useCompartir({
    path,
    titulo,
    texto,
    vistaPrevia,
  });

  return (
    <>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation(); // no abrir la tarjeta que lo contiene
          compartir();
        }}
        className={className ?? CLASES_POR_DEFECTO}
      >
        <i className='ti ti-share-3 text-[13px]' /> Compartir
      </button>
      {modal}
    </>
  );
}