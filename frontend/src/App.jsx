import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/Layout';
import { allProtectedRoutes } from './config/navConfig';

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

function AppRoutes() {
  return (
    <Routes>
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
        {allProtectedRoutes.map(({ path, element }) =>
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
