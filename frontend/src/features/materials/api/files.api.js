import { apiFetch } from '@/shared/api/client';

export async function descargarArchivo(archivo) {
  const blob = await apiFetch(`/archivos/${archivo.id}/descargar`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo.nombre_archivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function subirArchivo(apunteId, file) {
  const formData = new FormData();
  formData.append('archivo', file);
  const res = await apiFetch(`/archivos/apunte/${apunteId}`, {
    method: 'POST',
    body: formData,
  });
  return res.data;
}

export async function subirArchivos(apunteId, files) {
  const resultados = await Promise.allSettled(
    files.map((file) => subirArchivo(apunteId, file)),
  );

  const exitosos = [];
  const fallidos = [];
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled') exitosos.push(r.value);
    else fallidos.push({ file: files[i], error: r.reason });
  });

  return { exitosos, fallidos };
}

export async function eliminarArchivo(id) {
  return apiFetch(`/archivos/${id}`, { method: 'DELETE' });
}
