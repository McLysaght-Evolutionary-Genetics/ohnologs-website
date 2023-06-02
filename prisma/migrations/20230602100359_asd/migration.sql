/*
  Warnings:

  - You are about to drop the column `completness` on the `Species` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GenomeCompleteness" AS ENUM ('chromosome', 'scaffold');

-- AlterTable
ALTER TABLE "Species" DROP COLUMN "completness",
ADD COLUMN     "completeness" "GenomeCompleteness" NOT NULL DEFAULT 'chromosome';

-- DropEnum
DROP TYPE "GenomeCompletnesss";
