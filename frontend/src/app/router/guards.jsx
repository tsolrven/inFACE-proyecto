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
      />
    );
  }

  // cuentas antiguas o cambio de versión: primero deben aceptar los términos vigentes
  if (usuario.terminos_vigentes === false) {
    return (
      <Navigate
        to='/aceptar-terminos'
        replace
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
  if (usuario.terminos_vigentes === false) {
    return (
      <Navigate
        to='/aceptar-terminos'
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

export function TermsRoute({ children }) {
  const usuario = useAuthStore((s) => s.usuario);
  if (!usuario) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }
  // si ya aceptó la versión vigente, no hay nada que aceptar
  if (usuario.terminos_vigentes !== false) {
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
  return !usuario ? (
    children
  ) : (
    <Navigate
      to='/'
      replace
    />
  );
}