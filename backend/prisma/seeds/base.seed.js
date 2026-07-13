//* USUARIOS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const usuarios = [
  {
    correo: 'est_der@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'estudiante',
    nombre_usuario: 'est_der',
    carrera: 'DER',
    campus: 'Concepción',
  },
  {
    correo: 'est_ieci@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'estudiante',
    nombre_usuario: 'est_ieci',
    carrera: 'IECI',
    campus: 'Concepción',
  },
  {
    correo: 'est_icinf@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'estudiante',
    nombre_usuario: 'est_icinf',
    carrera: 'ICINF',
    campus: 'Chillán',
  },
  {
    correo: 'est_cpa@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'estudiante',
    nombre_usuario: 'est_cpa',
    carrera: 'CPA',
    campus: 'Concepción',
  },
  {
    correo: 'est_ico@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'estudiante',
    nombre_usuario: 'est_ico',
    carrera: 'ICO',
    campus: 'Concepción',
  },
];

//* SEED BASE ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function seedBase(prisma, bcrypt, carrerasCreadas) {
  console.log('--- Seed base ---');

  //* Usuarios de prueba
  const usuariosCreados = {};
  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.contrasena, 10);
    const usuario = await prisma.usuario.upsert({
      where: { correo: u.correo },
      update: {},
      create: {
        correo: u.correo,
        contrasena: hash,
        rol: u.rol,
        perfil: {
          create: { nombre_usuario: u.nombre_usuario, campus: u.campus },
        },
      },
      include: { perfil: true },
    });

    if (u.carrera) {
      await prisma.usuarioCarrera.upsert({
        where: {
          usuario_id_carrera_id: {
            usuario_id: usuario.id,
            carrera_id: carrerasCreadas[u.carrera].id,
          },
        },
        update: {},
        create: {
          usuario_id: usuario.id,
          carrera_id: carrerasCreadas[u.carrera].id,
        },
      });
    }

    usuariosCreados[u.nombre_usuario] = usuario;
    console.log(`Usuario: ${u.correo} (${u.rol})`);
  }

  console.log('--- Seed base completado ---\n');

  return {
    carreras: carrerasCreadas,
    usuarios: usuariosCreados,
  };
}
