import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import ToastContainer from '@/shared/components/ui/Toast';
import AppRoutes from '@/app/router/AppRoutes';

function SplashScreen() {
  return (
    <div className='flex h-screen w-screen items-center justify-center bg-neutral-950'>
      <i className='ti ti-loader-2 animate-spin text-3xl text-pink-500' />
    </div>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  const cargando = useAuthStore((s) => s.cargando);

  useEffect(() => {
    init();
  }, [init]);

  if (cargando) return <SplashScreen />;

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
}
