import prisma from "src/prismaClient";

export const addCrypto = async (userId: string, name: string, symbol: string, price: number, trend: number) => {
  return await prisma.cryptocurrency.create({
    data: {
      name,
      symbol,
      price,
      trend,
      userId,
    },
  });
};

export const getCryptos = async () => {
    return await prisma.cryptocurrency.findMany();
  };
  

export const getUserCryptos = async (userId: string) => {
    return await prisma.cryptocurrency.findMany({
      where: {
        userId: userId,
      },
    });
  };

export const deleteCrypto = async (cryptoId: string, userId: string) => {
  const crypto = await prisma.cryptocurrency.findFirst({
    where: {
      id: cryptoId,
      userId: userId,
    },
  });

  if (!crypto) {
    throw new Error('Criptomoneda no encontrada');
  }

  await prisma.cryptocurrency.delete({
    where: {
      id: cryptoId,
    },
  });

  return crypto;
};
