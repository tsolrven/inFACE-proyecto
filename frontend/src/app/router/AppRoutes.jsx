import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Login, Register, Onboarding, AcceptTerms } from '@/features/auth';
import Layout from '@/app/layout/Layout';
import { protectedRoutes, extraRoutes, modalRoutes } from '@/app/router/routes';
import NotFound from '@/pages/NotFoundPage';
import {
  ProtectedRoute,
  OnboardingRoute,
  GuestRoute,
  TermsRoute,
} from '@/app/router/guards';

// páginas legales PÚBLICAS: el registro las enlaza y quien aún no tiene cuenta debe poder leerlas
const TerminosPublico = lazy(() => import('@/pages/legal/UserAgreementPage'));
const PrivacidadPublico = lazy(() => import('@/pages/legal/PrivacyPolicyPage'));
function LegalPublico({ children }) {
  return (
    <div className='min-h-screen bg-[#0B0B0E]'>
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}

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
          path='/legal/terminos'
          element={
            <LegalPublico>
              <TerminosPublico />
            </LegalPublico>
          }
        />
        <Route
          path='/legal/privacidad'
          element={
            <LegalPublico>
              <PrivacidadPublico />
            </LegalPublico>
          }
        />
        <Route
          path='/aceptar-terminos'
          element={
            <TermsRoute>
              <AcceptTerms />
            </TermsRoute>
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
