import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCryptos = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
  
    try {
      const cryptos = await prisma.cryptocurrency.findMany({
        where: { userId },
      });
      res.json(cryptos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las criptomonedas' });
    }
  };

  export const addCrypto = async (req: Request, res: Response) => {
    const userId = (req as any).userId;  // Obtén el ID del usuario autenticado
    const { name, symbol, price, trend } = req.body;
  
    try {
      const newCrypto = await prisma.cryptocurrency.create({
        data: {
          name,
          symbol,
          price,
          trend,
          user: {
            connect: { id: userId },  // Conectar la criptomoneda con el usuario
          },
        },
      });
  
      res.status(201).json(newCrypto);
    } catch (error) {
      console.error('Error al añadir la criptomoneda:', error);
      res.status(500).json({ error: 'Error interno del servidor al añadir la criptomoneda.' });
    }
};

export const getUserCryptos = async (req: Request, res: Response) => {
  const userId = (req as any).userId; // Obtener el ID del usuario autenticado

  try {
    const cryptos = await prisma.cryptocurrency.findMany({
      where: { userId },
    });

    res.json(cryptos); // Devolver las criptomonedas que el usuario sigue
  } catch (error) {
    console.error('Error al obtener las criptomonedas:', error);
    res.status(500).json({ error: 'Error al obtener las criptomonedas' });
  }
};
