-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultivations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seedStrain" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "yield_g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit_brl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationDays" INTEGER NOT NULL DEFAULT 0,
    "hasSevereProblems" BOOLEAN NOT NULL DEFAULT false,
    "area_m2" DOUBLE PRECISION NOT NULL DEFAULT 2.25,
    "custo_equip_iluminacao" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "custo_tenda_estrutura" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "custo_ventilacao_exaustao" DOUBLE PRECISION NOT NULL DEFAULT 800,
    "custo_outros_equipamentos" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "potencia_watts" INTEGER NOT NULL DEFAULT 480,
    "producao_por_planta_g" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "dias_vegetativo" INTEGER NOT NULL DEFAULT 60,
    "dias_veg" INTEGER NOT NULL DEFAULT 18,
    "dias_racao" INTEGER NOT NULL DEFAULT 70,
    "horas_luz_flor" INTEGER NOT NULL DEFAULT 12,
    "dias_secagem_cura" INTEGER NOT NULL DEFAULT 20,
    "preco_kwh" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "custo_sementes_clones" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "custo_substrato" DOUBLE PRECISION NOT NULL DEFAULT 120,
    "custo_nutrientes" DOUBLE PRECISION NOT NULL DEFAULT 350,
    "custos_operacionais_misc" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "preco_venda_por_grama" DOUBLE PRECISION NOT NULL DEFAULT 45,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "cultivations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultivation_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "photos" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cultivationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "cultivation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "correctiveAction" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cultivationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cultivations" ADD CONSTRAINT "cultivations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivation_events" ADD CONSTRAINT "cultivation_events_cultivationId_fkey" FOREIGN KEY ("cultivationId") REFERENCES "cultivations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivation_events" ADD CONSTRAINT "cultivation_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_cultivationId_fkey" FOREIGN KEY ("cultivationId") REFERENCES "cultivations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
