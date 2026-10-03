import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

import { seedCareers } from './careers.seed.js';
import { seedCourses } from './courses.seed.js';

import { seedBase } from './base.seed.js';
import { seedMatching } from './matching.seed.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\nIniciando seed...\n');

  const carrerasCreadas = await seedCareers(prisma);
  await seedCourses(prisma, carrerasCreadas);

  const contexto = await seedBase(prisma, bcrypt, carrerasCreadas);

  await seedMatching(prisma, contexto);

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
