/*
  Warnings:

  - Added the required column `initialPrice` to the `CryptoAlert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CryptoAlert" ADD COLUMN     "initialPrice" DOUBLE PRECISION NOT NULL;
