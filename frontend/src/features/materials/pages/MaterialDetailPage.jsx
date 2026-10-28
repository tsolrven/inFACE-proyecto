import MaterialsPage from '@/features/materials/pages/MaterialsPage';
import MaterialDetailModal from '@/features/materials/components/MaterialDetailModal';

// entrando por link directo: el feed queda de fondo y el detalle encima
export default function MaterialDetailPage() {
  return (
    <>
      <MaterialsPage />
      <MaterialDetailModal />
    </>
  );
}
