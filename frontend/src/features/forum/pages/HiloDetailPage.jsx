import ForumPage from '@/features/forum/pages/ForumPage';
import HiloDetailModal from '@/features/forum/components/HiloDetailModal';

// entrando por link directo: la lista queda de fondo y el detalle encima
export default function HiloDetailPage() {
  return (
    <>
      <ForumPage />
      <HiloDetailModal />
    </>
  );
}
