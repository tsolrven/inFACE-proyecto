import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// Orígenes del frontend autorizados a llamar a la API, separados por coma.
// Ejemplo: CORS_ORIGIN=http://localhost:5173,https://inface.ubiobio.cl
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

const MIN_LARGO_SECRETO = 32;

// el servidor no arranca si falta algo crítico: es mejor fallar al inicio
// que descubrirlo en el primer login
function validarEntorno() {
  const errores = [];

  for (const nombre of [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ]) {
    if (!process.env[nombre]) errores.push(`=> Falta la variable ${nombre}`);
  }

  const access = process.env.JWT_ACCESS_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;

  for (const [nombre, valor] of [
    ['JWT_ACCESS_SECRET', access],
    ['JWT_REFRESH_SECRET', refresh],
  ]) {
    if (valor && valor.length < MIN_LARGO_SECRETO) {
      errores.push(
        `=> ${nombre} debe tener al menos ${MIN_LARGO_SECRETO} caracteres`,
      );
    }
  }

  if (access && refresh && access === refresh) {
    errores.push(
      '=> JWT_ACCESS_SECRET y JWT_REFRESH_SECRET deben ser distintos',
    );
  }

  if (errores.length > 0) {
    console.error('Configuración de entorno inválida:');
    errores.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  }
}

validarEntorno();

export { PORT, CORS_ORIGINS };
