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
import Layout from './components/Layout';
import {
  allProtectedRoutes,
  extraRoutes,
  modalRoutes,
} from './config/navConfig';

function ProtectedRoute({ children }) {
  const usuario = useAuthStore((s) => s.usuario);
  return usuario ? (
    children
  ) : (
    <Navigate
      to='/login'
      replace
    />
  );
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
    </BrowserRouter>
  );
}
