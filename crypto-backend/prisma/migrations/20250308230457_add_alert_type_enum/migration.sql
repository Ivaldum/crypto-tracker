/*
  Warnings:

  - The `alertType` column on the `CryptoAlert` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('up', 'down');

-- AlterTable
ALTER TABLE "CryptoAlert" DROP COLUMN "alertType",
ADD COLUMN     "alertType" "AlertType" NOT NULL DEFAULT 'up';
