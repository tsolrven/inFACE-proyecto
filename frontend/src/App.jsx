import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Layout from './components/Layout';
import ToastContainer from './components/ui/Toast';
import Perfil from './pages/Perfil';
import PerfilPublico from './pages/PerfilPublico';
import {
  allProtectedRoutes,
  extraRoutes,
  modalRoutes,
} from './config/navConfig';

function ProtectedRoute({ children }) {
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

function OnboardingRoute({ children }) {
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

function GuestRoute({ children }) {
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

function SplashScreen() {
  return (
    <div className='flex h-screen w-screen items-center justify-center bg-neutral-950'>
      <i className='ti ti-loader-2 animate-spin text-3xl text-pink-500' />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route
          path='/login'
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path='/register'
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path='/onboarding'
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {[...allProtectedRoutes, ...extraRoutes].map(({ path, element }) =>
            path === '/' ? (
              <Route
                key={path}
                index
                element={element}
              />
            ) : (
              <Route
                key={path}
                path={path}
                element={element}
              />
            ),
          )}

          <Route
            path='/perfil'
            element={<Perfil />}
          />
          <Route
            path='/perfil/usuario/:nombreUsuario'
            element={<PerfilPublico />}
          />
        </Route>

        <Route
          path='*'
          element={
            <Navigate
              to='/login'
              replace
            />
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          {modalRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}
        </Routes>
      )}
    </>
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
