import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarProductos({
  categoria,
  condicion,
  estado,
  orden,
  precio_min,
  precio_max,
  solo_mios,
  busqueda,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    categoria,
    condicion,
    estado,
    orden,
    precio_min,
    precio_max,
    solo_mios: solo_mios ? 'true' : null,
    busqueda,
    pagina,
    limite,
  });
  const res = await apiFetch(`/productos${qs ? `?${qs}` : ''}`, { signal });
  return { productos: res.data, meta: res.meta };
}

export async function obtenerProducto(id, { signal } = {}) {
  const res = await apiFetch(`/productos/${id}`, { signal });
  return res.data;
}

export async function crearProducto(payload, fotos = []) {
  const formData = new FormData();
  formData.append('datos', JSON.stringify(payload));
  fotos.forEach((f) => formData.append('archivos', f));
  const res = await apiFetch('/productos', { method: 'POST', body: formData });
  return res.data;
}

export async function actualizarProducto(id, payload) {
  const res = await apiFetch(`/productos/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function eliminarProducto(id) {
  return apiFetch(`/productos/${id}`, { method: 'DELETE' });
}