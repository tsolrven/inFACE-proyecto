-- CreateTable
CREATE TABLE "descartes_proyecto" (
    "usuario_id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descartes_proyecto_pkey" PRIMARY KEY ("usuario_id","proyecto_id")
);

-- AddForeignKey
ALTER TABLE "descartes_proyecto" ADD CONSTRAINT "descartes_proyecto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descartes_proyecto" ADD CONSTRAINT "descartes_proyecto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
