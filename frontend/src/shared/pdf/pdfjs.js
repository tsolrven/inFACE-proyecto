// Carga diferida de pdf.js (y su worker): solo se descarga la primera vez que
// se muestra un PDF. Una sola promesa para toda la app.
let promesa = null;

export function cargarPdfjs() {
  promesa ??= Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
  return promesa;
}