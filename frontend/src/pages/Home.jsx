import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { usuario, logout } = useAuthStore();

  return (
    <div className='min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4'>
      <p className='text-neutral-500 text-sm'>
        Bienvenido{usuario?.nombre_usuario ? `, ${usuario.nombre_usuario}` : ''}
      </p>
      <button
        onClick={logout}
        className='text-xs text-neutral-600 hover:text-neutral-400 transition underline'
      >
        Cerrar sesión
      </button>
    </div>
  );
}
