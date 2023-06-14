-- CreateTable
CREATE TABLE "MsynTrack" (
    "blockId" TEXT NOT NULL,
    "scaffoldId" TEXT NOT NULL,

    CONSTRAINT "MsynTrack_pkey" PRIMARY KEY ("blockId","scaffoldId")
);

-- AddForeignKey
ALTER TABLE "MsynTrack" ADD CONSTRAINT "MsynTrack_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "MsynBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MsynTrack" ADD CONSTRAINT "MsynTrack_scaffoldId_fkey" FOREIGN KEY ("scaffoldId") REFERENCES "Scaffold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
