// Contenedor de un campo de formulario: etiqueta arriba y, opcionalmente, un
// elemento a la derecha (contador de caracteres, tooltip…).
export default function Campo({ label, extra, children }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between'>
        <span className='text-[11.5px] font-semibold text-neutral-500'>
          {label}
        </span>
        {extra}
      </div>
      {children}
    </div>
  );
}
