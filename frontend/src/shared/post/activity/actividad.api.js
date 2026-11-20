import { apiFetch } from '@/shared/api/client';

// Actividad académica del perfil (RF-T-12)
// tipo: 'apunte' | 'hilo' | 'anuncio'; lista: 'publicaciones' | 'comentarios'
// carreraId: solo esa carrera; sin él, todas (docente)
export async function listarActividad({
  usuarioId,
  tipo,
  lista,
  carreraId,
  pagina = 1,
  limite = 20,
  signal,
}) {
  const qs = new URLSearchParams({ tipo, lista, pagina, limite });
  if (carreraId) qs.set('carrera_id', carreraId);
  const res = await apiFetch(`/actividad/${usuarioId}?${qs.toString()}`, {
    signal,
  });
  return { items: res.data, meta: res.meta };
}