import { combinarPesos } from './recomendador.config.js';

const sigmoide01 = (x, escala) => (Math.tanh(x / escala) + 1) / 2;

export function componenteDeclarado(etiquetasProyecto, misEtiquetas) {
  if (etiquetasProyecto.length === 0) return 0;
  const coinciden = etiquetasProyecto.filter((e) => misEtiquetas.has(e)).length;
  return coinciden / etiquetasProyecto.length;
}

// Afinidad por etiqueta aprendida del comportamiento del usuario
export function afinidadPorEtiqueta(historial) {
  const afinidad = new Map();
  for (const h of historial) {
    for (const e of h.etiquetas)
      afinidad.set(e, (afinidad.get(e) ?? 0) + h.puntaje);
  }
  return afinidad;
}

export function componenteInferido(etiquetasProyecto, afinidad, escala) {
  if (afinidad.size === 0 || etiquetasProyecto.length === 0) return null;
  const suma = etiquetasProyecto.reduce(
    (acc, e) => acc + (afinidad.get(e) ?? 0),
    0,
  );
  return sigmoide01(suma / etiquetasProyecto.length, escala);
}

export function componenteCluster(clusterUsuario, clusterProyecto) {
  if (clusterUsuario == null || clusterProyecto == null) return null;
  return clusterUsuario === clusterProyecto ? 1 : 0;
}

export function componentePares(neto, hayPares, escala) {
  if (!hayPares) return null;
  return sigmoide01(neto ?? 0, escala);
}

// Promedio ponderado de los componentes DISPONIBLES (los null se omiten y los pesos se renormalizan)
export function combinar(componentes, pesos) {
  let suma = 0;
  let total = 0;
  for (const [nombre, valor] of Object.entries(componentes)) {
    if (valor == null) continue;
    suma += pesos[nombre] * valor;
    total += pesos[nombre];
  }
  return total > 0 ? suma / total : 0;
}

// Puntúa una lista de proyectos candidatos para un usuario
export function puntuarCandidatos(entrada) {
  const {
    senales,
    puntaje: pesos,
    escalaInferido,
    escalaPares,
  } = combinarPesos(entrada.parametros);
  void senales;
  const afinidad = afinidadPorEtiqueta(entrada.historial);
  const salida = new Map();
  for (const c of entrada.candidatos) {
    const componentes = {
      declarado: componenteDeclarado(c.etiquetas, entrada.misEtiquetas),
      inferido: componenteInferido(c.etiquetas, afinidad, escalaInferido),
      cluster: componenteCluster(
        entrada.clusterUsuario,
        entrada.clusterDeProyecto?.get(c.id),
      ),
      pares: componentePares(
        entrada.netoPares?.get(c.id),
        entrada.hayPares,
        escalaPares,
      ),
    };
    salida.set(c.id, { puntaje: combinar(componentes, pesos), componentes });
  }
  return salida;
}

// Suma de pesos de las señales de un conjunto
export function sumarSenales(senalesPresentes, pesosSenales) {
  let total = 0;
  for (const [tipo, presente] of Object.entries(senalesPresentes)) {
    if (presente) total += pesosSenales[tipo] ?? 0;
  }
  return total;
}
