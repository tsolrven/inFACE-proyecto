export const PESOS_SENALES_DEFECTO = Object.freeze({
  postulacion: 3, // la señal más fuerte
  favorito: 2, // lo guardó para después
  like: 2, // voto positivo
  comentario: 1, // se involucró, pero un comentario puede ser una duda o una crítica
  dislike: -2, // voto negativo
  descarte: -3, // "no me interesa" explícito en Descubrir
});

export const PESOS_PUNTAJE_DEFECTO = Object.freeze({
  declarado: 0.45, // coincidencia con las etiquetas que el usuario eligió
  inferido: 0.2, // coincidencia con lo que revela su comportamiento
  cluster: 0.15, // el proyecto está en el mismo cluster que el usuario
  pares: 0.2, // lo que hicieron otros usuarios de su mismo cluster
});

export const ESCALA_INFERIDO = 3;
export const ESCALA_PARES = 3;

export function combinarPesos(parametros) {
  return {
    senales: { ...PESOS_SENALES_DEFECTO, ...(parametros?.pesos_senales ?? {}) },
    puntaje: { ...PESOS_PUNTAJE_DEFECTO, ...(parametros?.pesos_puntaje ?? {}) },
    escalaInferido: parametros?.escala_inferido ?? ESCALA_INFERIDO,
    escalaPares: parametros?.escala_pares ?? ESCALA_PARES,
  };
}
