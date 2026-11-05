import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/shared/auth/authStore';
import { ROLES } from '@/shared/auth/roles';
import MisReportesPage from '@/features/reports/pages/MisReportesPage';

// el estudiante no descarga el código de moderación
const ModeracionPage = lazy(
  () => import('@/features/reports/pages/ModeracionPage'),
);

export default function ReportsPage() {
  const esSuperadmin = useAuthStore((s) => s.usuario?.rol === ROLES.SUPERADMIN);

  if (!esSuperadmin) return <MisReportesPage />;

  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      }
    >
      <ModeracionPage />
    </Suspense>
  );
}