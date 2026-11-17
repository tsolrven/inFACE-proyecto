import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES } from '@/shared/auth/roles';
import Landing from '@/pages/LandingPage';
import { AccesoDesdeComunidades } from '@/features/communities';

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

// Solo superadmin. La seguridad real está en el backend: esto evita mostrar
// pantallas que no podrían cargar datos.
export function AdminRoute({ children }) {
  const esSuperadmin = useAuthStore((s) => s.usuario?.rol === ROLES.SUPERADMIN);
  if (!esSuperadmin) {
    return (
      <Navigate
        to='/'
        replace
      />
    );
  }
  return children;
}

// Páginas académicas principales (foro, materiales y anuncios de la carrera
// propia). Superadmin y docente las consultan desde las comunidades: ven un
// aviso con enlaces a cada comunidad, ya en la pestaña del módulo. Solo
// interfaz: la seguridad real está en el backend.
// modulo: 'foro' | 'materiales' | 'anuncios'
export function RutaAcademicaRoute({ modulo, children }) {
  const rol = useAuthStore((s) => s.usuario?.rol);
  if (rol === ROLES.SUPERADMIN || rol === ROLES.DOCENTE) {
    return <AccesoDesdeComunidades modulo={modulo} />;
  }
  return children;
}