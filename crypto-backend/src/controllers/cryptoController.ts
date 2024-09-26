import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
  const userId = (req as any).userId;

  const { name, symbol, price, trend } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la criptomoneda es obligatorio y debe ser un string.' });
  }
  if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
    return res.status(400).json({ error: 'El símbolo de la criptomoneda es obligatorio y debe ser un string.' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
  }
  if (typeof trend !== 'number') {
    return res.status(400).json({ error: 'La tendencia debe ser un número.' });
  }

  try {
    const newCrypto = await prisma.cryptocurrency.create({
      data: {
        name,
        symbol,
        price,
        trend,
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(newCrypto);
  } catch (error) {
    console.error('Error al añadir la criptomoneda:', error);

    if (error instanceof PrismaClientKnownRequestError) {
      return res.status(400).json({ error: 'Error al interactuar con la base de datos.' });
    }

    res.status(500).json({ error: 'Error interno del servidor al añadir la criptomoneda.' });
  }
};
