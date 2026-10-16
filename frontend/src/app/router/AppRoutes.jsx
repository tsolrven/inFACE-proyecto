import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Login, Register, Onboarding } from '@/features/auth';
import Layout from '@/app/layout/Layout';
import { protectedRoutes, extraRoutes, modalRoutes } from '@/app/router/routes';
import NotFound from '@/pages/NotFound';
import {
  ProtectedRoute,
  OnboardingRoute,
  GuestRoute,
} from '@/app/router/guards';

const Perfil = lazy(() => import('@/pages/Perfil'));
const PerfilPublico = lazy(() => import('@/pages/PerfilPublico'));

export default function AppRoutes() {
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
          {[...protectedRoutes, ...extraRoutes].map(
            ({ path, component: Page }) =>
              path === '/' ? (
                <Route
                  key={path}
                  index
                  element={<Page />}
                />
              ) : (
                <Route
                  key={path}
                  path={path}
                  element={<Page />}
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
          element={<NotFound />}
        />
      </Routes>

      {backgroundLocation && (
        <Suspense fallback={null}>
          <Routes>
            {modalRoutes.map(({ path, component: Modal }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Modal />
                  </ProtectedRoute>
                }
              />
            ))}
          </Routes>
        </Suspense>
      )}
    </>
  );
}
