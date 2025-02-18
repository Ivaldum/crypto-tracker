-- DropForeignKey
ALTER TABLE "CryptoAlert" DROP CONSTRAINT "CryptoAlert_cryptoId_userId_fkey";

-- AddForeignKey
ALTER TABLE "CryptoAlert" ADD CONSTRAINT "CryptoAlert_cryptoId_userId_fkey" FOREIGN KEY ("cryptoId", "userId") REFERENCES "Cryptocurrency"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
