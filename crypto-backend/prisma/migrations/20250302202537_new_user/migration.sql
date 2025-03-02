-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false;
