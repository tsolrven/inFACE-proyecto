const FORMATOS = [
  ['.png', [0x89, 0x50, 0x4e, 0x47]],
  ['.jpg', [0xff, 0xd8, 0xff]],
  ['.gif', [0x47, 0x49, 0x46, 0x38]],
];

export async function normalizarImagen(file) {
  try {
    const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    let real = FORMATOS.find(([, firma]) =>
      firma.every((byte, i) => b[i] === byte),
    )?.[0];
    const esWebp =
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50;
    if (esWebp) real = '.webp';
    if (!real) return file;

    const punto = file.name.lastIndexOf('.');
    const base = punto > 0 ? file.name.slice(0, punto) : file.name;
    const actual = punto > 0 ? file.name.slice(punto).toLowerCase() : '';
    const mismo = actual === real || (real === '.jpg' && actual === '.jpeg');
    if (mismo) return file;
    return new File([file], `${base}${real}`, { type: file.type });
  } catch {
    return file;
  }
}
