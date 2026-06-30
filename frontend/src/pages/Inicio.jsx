import { useAuthStore } from '../stores/authStore';

export default function Inicio() {
  const { usuario, logout } = useAuthStore();

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
      <p className='text-sm text-neutral-500'>
        Bienvenido{usuario?.nombre_usuario ? `, ${usuario.nombre_usuario}` : ''}
      </p>
      <button
        onClick={logout}
        className='text-xs text-neutral-600 underline transition hover:text-neutral-400'
      >
        Cerrar sesión
      </button>
    </div>
  );
}
