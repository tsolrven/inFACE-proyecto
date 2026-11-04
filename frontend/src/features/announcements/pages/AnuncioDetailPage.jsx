import AnnouncementsPage from '@/features/announcements/pages/AnnouncementsPage';
import AnuncioDetailModal from '@/features/announcements/components/AnuncioDetailModal';

// entrando por link directo: la lista queda de fondo y el detalle encima
export default function AnuncioDetailPage() {
  return (
    <>
      <AnnouncementsPage />
      <AnuncioDetailModal />
    </>
  );
}
