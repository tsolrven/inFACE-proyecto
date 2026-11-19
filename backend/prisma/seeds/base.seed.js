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
  // ── ROLES PARA TESTING MÓDULOS ACADÉMICOS Y MODERACIÓN ──
  {
    correo: 'cee_ieci@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'cee',
    nombre_usuario: 'cee_ieci',
    carrera: 'IECI',
    campus: 'Concepción',
  },
  {
    correo: 'tutor_ieci@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'tutor',
    nombre_usuario: 'tutor_ieci',
    carrera: 'IECI',
    campus: 'Concepción',
  },
  {
    correo: 'cee_der@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'cee',
    nombre_usuario: 'cee_der',
    carrera: 'DER',
    campus: 'Concepción',
  },
  {
    correo: 'tutor_der@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'tutor',
    nombre_usuario: 'tutor_der',
    carrera: 'DER',
    campus: 'Concepción',
  },
  {
    correo: 'cee_icinf@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'cee',
    nombre_usuario: 'cee_icinf',
    carrera: 'ICINF',
    campus: 'Chillán',
  },
  {
    correo: 'tutor_icinf@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'tutor',
    nombre_usuario: 'tutor_icinf',
    carrera: 'ICINF',
    campus: 'Chillán',
  },
  {
    correo: 'cee_cpa@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'cee',
    nombre_usuario: 'cee_cpa',
    carrera: 'CPA',
    campus: 'Concepción',
  },
  {
    correo: 'tutor_cpa@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'tutor',
    nombre_usuario: 'tutor_cpa',
    carrera: 'CPA',
    campus: 'Concepción',
  },
  {
    correo: 'cee_ico@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'cee',
    nombre_usuario: 'cee_ico',
    carrera: 'ICO',
    campus: 'Concepción',
  },
  {
    correo: 'tutor_ico@alumnos.ubiobio.cl',
    contrasena: 'Test1234',
    rol: 'tutor',
    nombre_usuario: 'tutor_ico',
    carrera: 'ICO',
    campus: 'Concepción',
  },
  // docentes ── (rol base por dominio @ubiobio.cl; SIN carrera: publican en
  // foro y materiales de cualquier carrera desde las comunidades)
  {
    correo: 'docente1@ubiobio.cl', //docente 
    contrasena: 'Test1234',
    rol: 'docente',
    nombre_usuario: 'docente1',
    nombre_completo: 'Docente Uno',
    cargo: 'academico',
    campus: 'Concepción',
  },
  // superadmin ──
  {
    correo: 'admin_doc@ubiobio.cl', //superadmin-docente
    contrasena: 'Test1234',
    rol: 'superadmin',
    nombre_usuario: 'admin_docente',
    nombre_completo: 'admin docente',
    cargo: 'funcionario',
    campus: 'Concepción',
  },
  {
    correo: 'admin_est@alumnos.ubiobio.cl', //superadmin-estudiante
    contrasena: 'Test1234',
    rol: 'superadmin',
    nombre_usuario: 'admin_estudiante',
    carrera: 'IECI',
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
        rol: u.rol === 'cee' || u.rol === 'tutor' ? 'estudiante' : u.rol,
        perfil: {
          create: {
            nombre_usuario: u.nombre_usuario,
            campus: u.campus,
            // como en el registro: solo los académicos traen nombre y cargo
            nombre_completo: u.nombre_completo ?? null,
            cargo: u.cargo ?? null,
          },
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

  //* Cargos de prueba: cada CEE/tutor recibe su asignación vigente.
  //* `desde` es 2 días atrás para no caer en el desfase UTC/Chile.
  const DIA_MS = 24 * 60 * 60 * 1000;
  for (const u of usuarios) {
    if (u.rol !== 'cee' && u.rol !== 'tutor') continue;
    const usuario_id = usuariosCreados[u.nombre_usuario].id;
    const carrera_id = carrerasCreadas[u.carrera].id;
    const existe = await prisma.asignacionRol.findFirst({
      where: { usuario_id, tipo: u.rol, carrera_id },
    });
    if (existe) continue;
    await prisma.asignacionRol.create({
      data: {
        usuario_id,
        tipo: u.rol,
        carrera_id,
        desde: new Date(Date.now() - 2 * DIA_MS),
        hasta: new Date(
          Date.now() + (u.nombre_usuario === 'tutor_der' ? 5 : 365) * DIA_MS,
        ),
        aprobada_por: usuariosCreados.admin_docente.id,
      },
    });
    console.log(`Cargo: ${u.nombre_usuario} (${u.rol} ${u.carrera})`);
  }

  console.log('--- Seed base completado ---\n');

  return {
    carreras: carrerasCreadas,
    usuarios: usuariosCreados,
  };
}
