-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaculdadeCurso" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "precoOriginal" DOUBLE PRECISION,
    "precoComBolsa" DOUBLE PRECISION,
    "vencimento" TIMESTAMP(3),
    "ofertaId" TEXT,
    "origem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaculdadeCurso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Curso_slug_key" ON "Curso"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_externalId_key" ON "Curso"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Unidade_externalId_key" ON "Unidade"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "FaculdadeCurso_cursoId_unidadeId_modalidade_turno_key" ON "FaculdadeCurso"("cursoId", "unidadeId", "modalidade", "turno");

-- AddForeignKey
ALTER TABLE "FaculdadeCurso" ADD CONSTRAINT "FaculdadeCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaculdadeCurso" ADD CONSTRAINT "FaculdadeCurso_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
