import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import Landing from '@/pages/LandingPage';

export function ProtectedRoute({ children }) {
  const usuario = useAuthStore((s) => s.usuario);
  const location = useLocation();

  if (!usuario) {
    // sin sesión, la raíz del sitio muestra la landing pública en vez de mandar directo al login
    if (location.pathname === '/') {
      return <Landing />;
    }
    return (
      <Navigate
        to='/login'
        replace
        state={{ from: location }}
      />
    );
  }

  // mientras no configure sus intereses, no puede entrar al resto de la app
  if (usuario.tiene_intereses === false) {
    return (
      <Navigate
        to='/onboarding'
        replace
      />
    );
  }
  return children;
}

export function OnboardingRoute({ children }) {
  const usuario = useAuthStore((s) => s.usuario);
  if (!usuario) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }
  // si ya configuró intereses, no tiene sentido que vuelva a ver el onboarding
  if (usuario.tiene_intereses !== false) {
    return (
      <Navigate
        to='/'
        replace
      />
    );
  }
  return children;
}

export function GuestRoute({ children }) {
  const usuario = useAuthStore((s) => s.usuario);
  const location = useLocation();
  if (!usuario) return children;
  const from = location.state?.from;
  return (
    <Navigate
      to={from ? `${from.pathname}${from.search}` : '/'}
      replace
    />
  );
}
