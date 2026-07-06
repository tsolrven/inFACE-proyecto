import { apiFetch } from '../api';

// El backend acepta UN archivo por request (multer .single('archivo')).
// Para varios archivos, se sube cada uno en su propio request.
export async function subirArchivo(apunteId, file, { onProgress } = {}) {
  const formData = new FormData();
  formData.append('archivo', file);
  // 'onProgress' queda reservado por si más adelante cambias a XHR para
  // progreso real; fetch no expone progreso de subida nativamente.
  const res = await apiFetch(`/archivos/${apunteId}`, {
    method: 'POST',
    body: formData,
  });
  return res.data;
}

// Sube varios archivos en paralelo y devuelve { exitosos, fallidos }
// para que la UI pueda avisar si alguno falló sin perder los que sí subieron.
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
