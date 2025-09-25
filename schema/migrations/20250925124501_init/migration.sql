/*
  Warnings:

  - Added the required column `FileName` to the `ArchivoAdjunto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dbo"."ArchivoAdjunto" ADD COLUMN     "FileName" TEXT NOT NULL;
