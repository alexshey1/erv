-- CreateTable
CREATE TABLE "cultivation_images" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "filename" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cultivationId" TEXT NOT NULL,
    "eventId" TEXT,

    CONSTRAINT "cultivation_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cultivation_images_publicId_key" ON "cultivation_images"("publicId");

-- AddForeignKey
ALTER TABLE "cultivation_images" ADD CONSTRAINT "cultivation_images_cultivationId_fkey" FOREIGN KEY ("cultivationId") REFERENCES "cultivations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivation_images" ADD CONSTRAINT "cultivation_images_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "cultivation_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
