/*
  Warnings:

  - The primary key for the `etiquetas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `favoritos_proyecto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `integrantes_proyecto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `postulaciones_proyecto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `proyecto_etiquetas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `proyectos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tipos_etiqueta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `usuario_etiquetas` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "etiquetas" DROP CONSTRAINT "etiquetas_tipo_etiqueta_id_fkey";

-- DropForeignKey
ALTER TABLE "favoritos_proyecto" DROP CONSTRAINT "favoritos_proyecto_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "integrantes_proyecto" DROP CONSTRAINT "integrantes_proyecto_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "postulaciones_proyecto" DROP CONSTRAINT "postulaciones_proyecto_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "proyecto_etiquetas" DROP CONSTRAINT "proyecto_etiquetas_etiqueta_id_fkey";

-- DropForeignKey
ALTER TABLE "proyecto_etiquetas" DROP CONSTRAINT "proyecto_etiquetas_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "usuario_etiquetas" DROP CONSTRAINT "usuario_etiquetas_etiqueta_id_fkey";

-- AlterTable
ALTER TABLE "etiquetas" DROP CONSTRAINT "etiquetas_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tipo_etiqueta_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "etiquetas_id_seq";

-- AlterTable
ALTER TABLE "favoritos_proyecto" DROP CONSTRAINT "favoritos_proyecto_pkey",
ALTER COLUMN "proyecto_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "favoritos_proyecto_pkey" PRIMARY KEY ("usuario_id", "proyecto_id");

-- AlterTable
ALTER TABLE "integrantes_proyecto" DROP CONSTRAINT "integrantes_proyecto_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "proyecto_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "integrantes_proyecto_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "integrantes_proyecto_id_seq";

-- AlterTable
ALTER TABLE "postulaciones_proyecto" DROP CONSTRAINT "postulaciones_proyecto_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "proyecto_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "postulaciones_proyecto_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "postulaciones_proyecto_id_seq";

-- AlterTable
ALTER TABLE "proyecto_etiquetas" DROP CONSTRAINT "proyecto_etiquetas_pkey",
ALTER COLUMN "proyecto_id" SET DATA TYPE TEXT,
ALTER COLUMN "etiqueta_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "proyecto_etiquetas_pkey" PRIMARY KEY ("proyecto_id", "etiqueta_id");

-- AlterTable
ALTER TABLE "proyectos" DROP CONSTRAINT "proyectos_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "proyectos_id_seq";

-- AlterTable
ALTER TABLE "tipos_etiqueta" DROP CONSTRAINT "tipos_etiqueta_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tipos_etiqueta_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tipos_etiqueta_id_seq";

-- AlterTable
ALTER TABLE "usuario_etiquetas" DROP CONSTRAINT "usuario_etiquetas_pkey",
ALTER COLUMN "etiqueta_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "usuario_etiquetas_pkey" PRIMARY KEY ("usuario_id", "etiqueta_id");

-- AddForeignKey
ALTER TABLE "etiquetas" ADD CONSTRAINT "etiquetas_tipo_etiqueta_id_fkey" FOREIGN KEY ("tipo_etiqueta_id") REFERENCES "tipos_etiqueta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_etiquetas" ADD CONSTRAINT "usuario_etiquetas_etiqueta_id_fkey" FOREIGN KEY ("etiqueta_id") REFERENCES "etiquetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones_proyecto" ADD CONSTRAINT "postulaciones_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrantes_proyecto" ADD CONSTRAINT "integrantes_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos_proyecto" ADD CONSTRAINT "favoritos_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_etiquetas" ADD CONSTRAINT "proyecto_etiquetas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_etiquetas" ADD CONSTRAINT "proyecto_etiquetas_etiqueta_id_fkey" FOREIGN KEY ("etiqueta_id") REFERENCES "etiquetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
