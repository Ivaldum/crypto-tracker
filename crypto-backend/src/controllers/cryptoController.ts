import { Response, Request } from 'express';
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
    const userId = res.locals.userId; 
  
    const { name, symbol, price, trend } = req.body;
  
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no válido.' });
    }
  
    try {
      const newCrypto = await prisma.cryptocurrency.create({
        data: {
          name,
          symbol,
          price,
          trend,
          userId, 
        },
      });
  
      res.status(201).json(newCrypto);
    } catch (error) {
      console.error('Error al añadir la criptomoneda:', error);
      res.status(500).json({ error: 'Error al añadir la criptomoneda' });
    }
  };
  
  

export const getUserCryptos = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const cryptos = await prisma.cryptocurrency.findMany({
      where: { userId },
    });

    res.json(cryptos); 
  } catch (error) {
    console.error('Error al obtener las criptomonedas:', error);
    res.status(500).json({ error: 'Error al obtener las criptomonedas' });
  }
};

export const deleteCrypto = async (req: Request, res: Response) => {
  const userId = res.locals.userId; 

  if (!userId) {
    return res.status(400).json({ message: 'ID de usuario no válido.' });
  }

  const cryptoId = req.params.id; 

  try {
    const crypto = await prisma.cryptocurrency.findFirst({
      where: {
        id: cryptoId,    
        userId: userId,  
      },
    });

    if (!crypto) {
      return res.status(404).json({ message: 'Criptomoneda no encontrada' });
    }

    await prisma.cryptocurrency.delete({
      where: {
        id: cryptoId, 
      },
    });

    res.status(200).json({ message: 'Criptomoneda eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la criptomoneda:', error);
    res.status(500).json({ error: 'Error al eliminar la criptomoneda' });
  }
};

