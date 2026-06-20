import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

//* se crea el pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//* se crea el adapter
const adapter = new PrismaPg(pool);

//* se crea PrismaClient con el adapter
const prisma = new PrismaClient({
  adapter,
  errorFormat: 'colorless',
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('=> Conexión exitosa a la base de datos PostgreSQL!');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

export { prisma, connectDB };
