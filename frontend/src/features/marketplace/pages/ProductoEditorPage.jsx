import { useNavigate, useParams } from 'react-router-dom';
import ProductoForm from '@/features/marketplace/components/ProductoForm';
import { useProducto } from '@/features/marketplace/hooks/useProductos';
import { useAuthStore } from '@/shared/auth/authStore';
import { rutas } from '@/features/marketplace/utils/catalogo';

export default function ProductoEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const { data: producto, isPlaceholderData, error } = useProducto(id);

  const volver = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(id ? rutas.producto(id) : rutas.inicio, { replace: true });
  };
  const alGuardar = (guardado) =>
    navigate(rutas.producto(guardado?.id ?? id), { replace: true });

  let contenido;
  if (id) {
    if (error) {
      contenido = (
        <div className='mx-auto w-full max-w-[680px] p-4'>
          <p className='p-8 text-center text-sm text-red-400'>
            {error.message}
          </p>
        </div>
      );
    } else if (!producto || isPlaceholderData) {
      contenido = (
        <div className='flex items-center justify-center py-20 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      );
    } else if (producto.vendedor?.id !== usuario?.id) {
      contenido = (
        <div className='mx-auto w-full max-w-[680px] p-4'>
          <p className='p-8 text-center text-sm text-red-400'>
            Solo el vendedor puede editar este producto.
          </p>
        </div>
      );
    } else {
      contenido = (
        <ProductoForm
          key={producto.id}
          producto={producto}
          onGuardado={alGuardar}
          onCancelar={volver}
        />
      );
    }
  } else {
    contenido = (
      <ProductoForm
        onGuardado={alGuardar}
        onCancelar={volver}
      />
    );
  }

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='mx-auto w-full max-w-[680px] px-3 pt-3 sm:px-4'>
        <button
          type='button'
          onClick={volver}
          className='flex items-center gap-1.5 text-[12.5px] text-neutral-500 hover:text-neutral-200'
        >
          <i className='ti ti-arrow-left' /> Volver
        </button>
      </div>
      {contenido}
    </div>
  );
}
