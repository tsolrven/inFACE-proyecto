import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// Orígenes del frontend autorizados a llamar a la API, separados por coma.
// Ejemplo: CORS_ORIGIN=http://localhost:5173,https://inface.ubiobio.cl
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

export { PORT, CORS_ORIGINS };
