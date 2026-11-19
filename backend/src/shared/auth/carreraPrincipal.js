// Un usuario tiene a lo más UNA carrera (@@unique([usuario_id]) en
// UsuarioCarrera; el docente, ninguna). Este orden ya no elige entre varias:
// se conserva porque autenticar y auth.service lo usan al leer
// usuario_carrera, que sigue siendo una lista de 0 o 1 elementos.
const ORDEN_CARRERAS_USUARIO = { carrera_id: 'asc' };

export { ORDEN_CARRERAS_USUARIO };
