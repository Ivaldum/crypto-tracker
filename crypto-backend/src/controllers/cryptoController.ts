import { Response, Request } from 'express';
import * as cryptoServices from '../services/cryptoServices';

export const addCrypto = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  const { name, symbol, price, trend } = req.body;

  try {
    const newCrypto = await cryptoServices.addCrypto(userId, name, symbol, price, trend);
    res.status(201).json(newCrypto);
  } catch (error) {
    console.error('Error al añadir la criptomoneda:', error);
    res.status(500).json({ error: 'Error al añadir la criptomoneda' });
  }
};

export const getCryptos = async (req: Request, res: Response) => {
  try {
    const cryptos = await cryptoServices.getCryptos();
    res.status(200).json(cryptos);
  } catch (error) {
    console.error('Error al obtener las criptomonedas:', error);
    res.status(500).json({ error: 'Error al obtener las criptomonedas' });
  }
};

export const getUserCryptos = async (req: Request, res: Response) => {
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(400).json({ message: 'ID de usuario no válido.' });
  }

  try {
    const userCryptos = await cryptoServices.getUserCryptos(userId);
    res.status(200).json(userCryptos);
  } catch (error) {
    console.error('Error al obtener las criptomonedas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener las criptomonedas del usuario' });
  }
};

export const deleteCrypto = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  const cryptoId = req.params.id;

  try {
    const deletedCrypto = await cryptoServices.deleteCrypto(cryptoId, userId);
    res.status(200).json(deletedCrypto);
  } catch (error) {
    console.error('Error al eliminar la criptomoneda:', error);
    res.status(500).json({ error: 'Error al eliminar la criptomoneda' });
  }
};