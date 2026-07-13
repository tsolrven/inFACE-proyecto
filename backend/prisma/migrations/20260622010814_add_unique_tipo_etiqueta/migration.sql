/*
  Warnings:

  - A unique constraint covering the columns `[nombre_tipo_etiqueta]` on the table `tipos_etiqueta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tipos_etiqueta_nombre_tipo_etiqueta_key" ON "tipos_etiqueta"("nombre_tipo_etiqueta");
