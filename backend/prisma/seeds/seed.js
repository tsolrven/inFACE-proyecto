import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: new URL('../.env', import.meta.url).pathname });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

import { seedBase } from './base.seed.js';
import { seedMatching } from './matching.seed.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Iniciando seed...\n');

    // Datos base compartidos 
    const contexto = await seedBase(prisma, bcrypt);

    // Módulos específicos 
    await seedMatching(prisma, contexto);


    console.log('Seed completado.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());