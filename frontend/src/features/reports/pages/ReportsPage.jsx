import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES } from '@/shared/auth/roles';
import MisReportesPage from '@/features/reports/pages/MisReportesPage';

// /reportes es «Mis reportes». El superadmin no reporta: su pantalla de
// moderación vive en Administración.
export default function ReportsPage() {
  const esSuperadmin = useAuthStore((s) => s.usuario?.rol === ROLES.SUPERADMIN);

  if (esSuperadmin) {
    return (
      <Navigate
        to='/admin/reportes'
        replace
      />
    );
  }
  return <MisReportesPage />;
}