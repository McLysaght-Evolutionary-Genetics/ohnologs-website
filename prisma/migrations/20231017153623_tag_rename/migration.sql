/*
  Warnings:

  - You are about to drop the column `data` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `meta` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "data",
ADD COLUMN     "meta" TEXT NOT NULL;