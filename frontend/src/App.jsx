import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

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
      to='/home'
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Navigate
            to='/login'
            replace
          />
        }
      />
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
        path='/home'
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
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
