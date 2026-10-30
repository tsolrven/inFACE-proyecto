import { useState } from 'react';
import { agregarArchivosSinDuplicar, extensionDe } from '@/shared/lib/archivos';

const MB = 1024 * 1024;

// Estado de un campo de archivos de formulario: archivos existentes (que se
// pueden marcar para quitar, el borrado real ocurre al guardar) y archivos
// nuevos (ordenables). Cada módulo pasa sus propios límites.
//   existentes: archivos ya guardados ({ id, ... })
//   max:        máximo de archivos en total (existentes que quedan + nuevos)
//   maxBytes:   tamaño máximo por archivo nuevo (null = sin validar)
//   extensiones: ['.jpg', ...] en minúsculas (null = cualquier tipo)
export function useArchivosForm({
  existentes = [],
  max,
  maxBytes = null,
  extensiones = null,
  singular = 'archivo',
  plural = 'archivos',
}) {
  const [nuevos, setNuevos] = useState([]);
  const [quitarIds, setQuitarIds] = useState([]);
  const [avisos, setAvisos] = useState([]);

  const quedan = existentes.filter((a) => !quitarIds.includes(a.id));
  const total = quedan.length + nuevos.length;
  const cupo = max - quedan.length; // lugares disponibles para archivos nuevos
  const hayCambios = quitarIds.length > 0 || nuevos.length > 0;

  // `elegidos`: arreglo de File (ya extraído del input)
  function agregar(elegidos) {
    const nuevosAvisos = [];
    const validos = [];
    for (const f of elegidos) {
      if (extensiones && !extensiones.includes(extensionDe(f.name))) {
        nuevosAvisos.push(`"${f.name}" no es un formato permitido`);
      } else if (maxBytes && f.size > maxBytes) {
        nuevosAvisos.push(`"${f.name}" supera ${Math.round(maxBytes / MB)} MB`);
      } else {
        validos.push(f);
      }
    }

    const combinados = agregarArchivosSinDuplicar(nuevos, validos);
    if (combinados.length > cupo) {
      nuevosAvisos.push(`Máximo ${max} ${plural}: se descartó el excedente`);
    }
    setNuevos(combinados.slice(0, Math.max(cupo, 0)));
    setAvisos(nuevosAvisos);
  }

  function quitarNuevo(index) {
    setNuevos((prev) => prev.filter((_, i) => i !== index));
    setAvisos([]);
  }

  function mover(index, delta) {
    setNuevos((prev) => {
      const destino = index + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  }

  function alternarExistente(id) {
    if (quitarIds.includes(id)) {
      // conservarlo otra vez no puede pasar del máximo
      if (total >= max) {
        setAvisos([
          `Máximo ${max} ${plural}: quita alguno de los nuevos antes de conservar uno de los existentes.`,
        ]);
        return;
      }
      setQuitarIds((prev) => prev.filter((x) => x !== id));
    } else {
      setQuitarIds((prev) => [...prev, id]);
    }
    setAvisos([]);
  }

  function reiniciar() {
    setNuevos([]);
    setQuitarIds([]);
    setAvisos([]);
  }

  return {
    existentes,
    nuevos,
    quitarIds,
    avisos,
    total,
    max,
    cupo,
    extensiones,
    singular,
    plural,
    hayCambios,
    agregar,
    quitarNuevo,
    mover,
    alternarExistente,
    reiniciar,
  };
}
