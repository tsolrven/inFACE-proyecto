-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'estudiante',
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "nombre_completo" TEXT,
    "biografia" TEXT,
    "campus" VARCHAR(12),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carreras" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "carreras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ramos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "semestre" INTEGER,
    "descripcion" TEXT,

    CONSTRAINT "ramos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hashtags" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_carreras" (
    "usuario_id" TEXT NOT NULL,
    "carrera_id" TEXT NOT NULL,
    "anio_ingreso" INTEGER,

    CONSTRAINT "usuarios_carreras_pkey" PRIMARY KEY ("usuario_id","carrera_id")
);

-- CreateTable
CREATE TABLE "ramos_carreras" (
    "ramo_id" TEXT NOT NULL,
    "carrera_id" TEXT NOT NULL,

    CONSTRAINT "ramos_carreras_pkey" PRIMARY KEY ("ramo_id","carrera_id")
);

-- CreateTable
CREATE TABLE "tipos_etiqueta" (
    "id" SERIAL NOT NULL,
    "nombre_tipo_etiqueta" VARCHAR(30) NOT NULL,

    CONSTRAINT "tipos_etiqueta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas" (
    "id" SERIAL NOT NULL,
    "tipo_etiqueta_id" INTEGER NOT NULL,
    "creada_por_usuario_id" TEXT,
    "nombre_etiqueta" VARCHAR(100) NOT NULL,
    "nombre_normalizado" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "aliases" TEXT,
    "es_predeterminada" BOOLEAN NOT NULL DEFAULT false,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_etiquetas" (
    "usuario_id" TEXT NOT NULL,
    "etiqueta_id" INTEGER NOT NULL,
    "nivel" VARCHAR(20),

    CONSTRAINT "usuario_etiquetas_pkey" PRIMARY KEY ("usuario_id","etiqueta_id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "tipo_contenido" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "padre_id" TEXT,
    "nivel" INTEGER NOT NULL DEFAULT 0,
    "contenido" TEXT NOT NULL,
    "votos_neto" INTEGER NOT NULL DEFAULT 0,
    "es_respuesta_aceptada" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votos" (
    "usuario_id" TEXT NOT NULL,
    "tipo_contenido" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votos_pkey" PRIMARY KEY ("usuario_id","tipo_contenido","contenido_id")
);

-- CreateTable
CREATE TABLE "archivos" (
    "id" TEXT NOT NULL,
    "tipo_contenido" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "ruta_url" TEXT NOT NULL,
    "tipo_mime" TEXT,
    "tamanio" INTEGER,

    CONSTRAINT "archivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apuntes" (
    "id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "ramo_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'apunte',
    "link_repositorio" TEXT,
    "codigo_snippet" TEXT,
    "votos_neto" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apuntes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apuntes_hashtags" (
    "apunte_id" TEXT NOT NULL,
    "hashtag_id" TEXT NOT NULL,

    CONSTRAINT "apuntes_hashtags_pkey" PRIMARY KEY ("apunte_id","hashtag_id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "creador_id" TEXT NOT NULL,
    "titulo_proyecto" VARCHAR(200) NOT NULL,
    "descripcion_proyecto" TEXT,
    "modalidad_proyecto" VARCHAR(20) NOT NULL,
    "maximo_integrantes" INTEGER,
    "estado_proyecto" VARCHAR(20) NOT NULL DEFAULT 'abierto',
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postulaciones_proyecto" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "postulante_id" TEXT NOT NULL,
    "mensaje_postulacion" TEXT,
    "estado_postulacion" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "fecha_postulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postulaciones_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrantes_proyecto" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "rol_en_proyecto" VARCHAR(50),
    "fecha_union" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrantes_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos_proyecto" (
    "usuario_id" TEXT NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_proyecto_pkey" PRIMARY KEY ("usuario_id","proyecto_id")
);

-- CreateTable
CREATE TABLE "proyecto_etiquetas" (
    "proyecto_id" INTEGER NOT NULL,
    "etiqueta_id" INTEGER NOT NULL,

    CONSTRAINT "proyecto_etiquetas_pkey" PRIMARY KEY ("proyecto_id","etiqueta_id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" TEXT NOT NULL,
    "reportado_por" TEXT NOT NULL,
    "tipo_contenido" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "detalle" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "revisado_por" TEXT,
    "revisado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_usuario_id_key" ON "perfiles"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_nombre_usuario_key" ON "perfiles"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "carreras_codigo_key" ON "carreras"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ramos_codigo_key" ON "ramos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "hashtags_nombre_key" ON "hashtags"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nombre_etiqueta_key" ON "etiquetas"("nombre_etiqueta");

-- CreateIndex
CREATE INDEX "comentarios_tipo_contenido_contenido_id_idx" ON "comentarios"("tipo_contenido", "contenido_id");

-- CreateIndex
CREATE INDEX "comentarios_padre_id_idx" ON "comentarios"("padre_id");

-- CreateIndex
CREATE INDEX "votos_tipo_contenido_contenido_id_idx" ON "votos"("tipo_contenido", "contenido_id");

-- CreateIndex
CREATE INDEX "archivos_tipo_contenido_contenido_id_idx" ON "archivos"("tipo_contenido", "contenido_id");

-- CreateIndex
CREATE INDEX "apuntes_ramo_id_idx" ON "apuntes"("ramo_id");

-- CreateIndex
CREATE INDEX "apuntes_tipo_idx" ON "apuntes"("tipo");

-- CreateIndex
CREATE INDEX "reportes_tipo_contenido_contenido_id_idx" ON "reportes"("tipo_contenido", "contenido_id");

-- CreateIndex
CREATE INDEX "reportes_estado_idx" ON "reportes"("estado");

-- AddForeignKey
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_carreras" ADD CONSTRAINT "usuarios_carreras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_carreras" ADD CONSTRAINT "usuarios_carreras_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carreras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ramos_carreras" ADD CONSTRAINT "ramos_carreras_ramo_id_fkey" FOREIGN KEY ("ramo_id") REFERENCES "ramos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ramos_carreras" ADD CONSTRAINT "ramos_carreras_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carreras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas" ADD CONSTRAINT "etiquetas_tipo_etiqueta_id_fkey" FOREIGN KEY ("tipo_etiqueta_id") REFERENCES "tipos_etiqueta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_etiquetas" ADD CONSTRAINT "usuario_etiquetas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_etiquetas" ADD CONSTRAINT "usuario_etiquetas_etiqueta_id_fkey" FOREIGN KEY ("etiqueta_id") REFERENCES "etiquetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_padre_id_fkey" FOREIGN KEY ("padre_id") REFERENCES "comentarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos" ADD CONSTRAINT "votos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apuntes" ADD CONSTRAINT "apuntes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apuntes" ADD CONSTRAINT "apuntes_ramo_id_fkey" FOREIGN KEY ("ramo_id") REFERENCES "ramos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apuntes_hashtags" ADD CONSTRAINT "apuntes_hashtags_apunte_id_fkey" FOREIGN KEY ("apunte_id") REFERENCES "apuntes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apuntes_hashtags" ADD CONSTRAINT "apuntes_hashtags_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones_proyecto" ADD CONSTRAINT "postulaciones_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones_proyecto" ADD CONSTRAINT "postulaciones_proyecto_postulante_id_fkey" FOREIGN KEY ("postulante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrantes_proyecto" ADD CONSTRAINT "integrantes_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrantes_proyecto" ADD CONSTRAINT "integrantes_proyecto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos_proyecto" ADD CONSTRAINT "favoritos_proyecto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos_proyecto" ADD CONSTRAINT "favoritos_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_etiquetas" ADD CONSTRAINT "proyecto_etiquetas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_etiquetas" ADD CONSTRAINT "proyecto_etiquetas_etiqueta_id_fkey" FOREIGN KEY ("etiqueta_id") REFERENCES "etiquetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_reportado_por_fkey" FOREIGN KEY ("reportado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
