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

// Aplica los cambios de archivos de un contenido que ya existe. Orden fijo:
//   1. quitar, uno tras otro, ANTES de subir (el backend compara el total
//      contra el máximo permitido);
//   2. subir, uno tras otro (ver subirArchivos).
// Un archivo que falla no detiene al resto: no lanza, devuelve el detalle para
// que quien la llama decida qué mostrar.
//   quitar: ids de archivos existentes · nuevos: File[]
export async function sincronizarArchivos(
  tipoContenido,
  contenidoId,
  { quitar = [], nuevos = [] } = {},
) {
  const quitados = [];
  const fallidosQuitar = [];
  for (const id of quitar) {
    try {
      await eliminarArchivo(id);
      quitados.push(id);
    } catch (error) {
      fallidosQuitar.push({ id, error });
    }
  }

  const { exitosos, fallidos } =
    nuevos.length > 0
      ? await subirArchivos(tipoContenido, contenidoId, nuevos)
      : { exitosos: [], fallidos: [] };

  return {
    quitados, // ids
    fallidosQuitar, // [{ id, error }]
    subidos: exitosos, // archivos tal como los devuelve el backend
    fallidosSubir: fallidos, // [{ file, error }]
  };
}

// Imagen para mostrar en pantalla (GET /archivos/:id/ver). A diferencia de
// /descargar, NO incrementa el contador de descargas. Devuelve un Blob.
export function obtenerImagen(id, signal) {
  return apiFetch(`/archivos/${id}/ver`, { responseType: 'blob', signal });
}

// Descarga el archivo al equipo (GET /archivos/:id/descargar, que sí cuenta
// la descarga). Recibe el objeto archivo tal como viene del backend.
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