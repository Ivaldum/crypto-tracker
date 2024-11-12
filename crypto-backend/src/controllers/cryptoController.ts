import { Response, Request } from 'express';
import { CryptoProvider } from 'src/providers/cryptoProvider';
import { Crypto } from 'src/interfaces/Crypto'; 

export class CryptoController {
  cryptoProvider: CryptoProvider;

  constructor(cryptoProvider: CryptoProvider) {
    this.cryptoProvider = cryptoProvider;
  }

  addCrypto = async (req: Request, res: Response) => {
    const userId = res.locals.userId;  
    const { id, name, symbol, price, trend } = req.body; 
  
    try {
      if (!userId || !id || !name || !symbol || price === undefined || trend === undefined) {
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
      }
  
      const newCrypto: Crypto = await this.cryptoProvider.addCrypto(userId, id, name, symbol, price, trend);
      res.status(201).json(newCrypto);
    } catch (error) {
      console.error('Error al añadir la criptomoneda:', error);
      res.status(500).json({ error: 'Error al añadir la criptomoneda.' });
    }
  };

  getCryptos = async (req: Request, res: Response) => {
    const { sort, filter } = req.query;

    try {
      const cryptos: Crypto[] = await this.cryptoProvider.getCryptos({
        sort: sort as string,
        filter: filter ? (filter as string) : undefined, 
      });

      res.status(200).json(cryptos);
    } catch (error) {
      console.error('Error al obtener criptomonedas:', error);
      res.status(500).json({ error: 'Error al obtener criptomonedas' });
    }
  };

  getUserCryptos = async (req: Request, res: Response) => {
    const userId = res.locals.userId;

    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no válido.' });
    }

    try {
      const userCryptos: Crypto[] = await this.cryptoProvider.getUserCryptos(userId);
      res.status(200).json(userCryptos);
    } catch (error) {
      console.error('Error al obtener las criptomonedas del usuario:', error);
      res.status(500).json({ error: 'Error al obtener las criptomonedas del usuario' });
    }
  };

  getCryptoDetails = async (req: Request, res: Response) => {
    const { id } = req.params;  
    const userId = res.locals.userId; 

    try {
      const { crypto, priceHistory } = await this.cryptoProvider.getCryptoDetails(id, userId);
      res.status(200).json({ crypto, priceHistory });
    } catch (error) {
      console.error('Error al obtener detalles de la criptomoneda:', error);
      res.status(500).json({ error: 'Error al obtener detalles de la criptomoneda' });
    }
  };

  deleteCrypto = async (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const cryptoId = req.params.id;

    try {
      await this.cryptoProvider.deleteCrypto(cryptoId, userId);
      res.status(204).send(); 
    } catch (error) {
      console.error('Error al eliminar la criptomoneda:', error);
      res.status(500).json({ error: 'Error al eliminar la criptomoneda' });
    }
  };
}
