import { apiFetch } from '@/shared/api/client';

// Sube UN archivo a un contenido existente (POST /archivos/:tipo/:id).
// El backend valida autor, extensión según el tipo y máximo de archivos.
export async function subirArchivo(tipoContenido, contenidoId, file) {
  const formData = new FormData();
  formData.append('archivo', file);
  const res = await apiFetch(`/archivos/${tipoContenido}/${contenidoId}`, {
    method: 'POST',
    body: formData,
  });
  return res.data;
}

// Uno tras otro, a propósito: el backend cuenta los archivos sin transacción,
// y en paralelo dos subidas podrían pasar el límite a la vez.
export async function subirArchivos(tipoContenido, contenidoId, files) {
  const exitosos = [];
  const fallidos = [];
  for (const file of files) {
    try {
      exitosos.push(await subirArchivo(tipoContenido, contenidoId, file));
    } catch (error) {
      fallidos.push({ file, error });
    }
  }
  return { exitosos, fallidos };
}

export async function eliminarArchivo(id) {
  return apiFetch(`/archivos/${id}`, { method: 'DELETE' });
}
