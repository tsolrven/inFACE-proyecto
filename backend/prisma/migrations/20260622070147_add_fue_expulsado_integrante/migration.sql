-- AlterTable
ALTER TABLE "integrantes_proyecto" ADD COLUMN     "fecha_expulsion" TIMESTAMP(3),
ADD COLUMN     "fue_expulsado" BOOLEAN NOT NULL DEFAULT false;
