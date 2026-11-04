// Orden único para elegir la "carrera principal" de un usuario cuando tiene
// varias. Lo usan autenticar (middleware) y auth.service, para que el backend
// y el `carreras[0]` que ve el frontend coincidan.
// Es un criterio provisional (determinista, pero arbitrario) hasta que exista
// el selector de alcance.
const ORDEN_CARRERAS_USUARIO = { carrera_id: 'asc' };

export { ORDEN_CARRERAS_USUARIO };
