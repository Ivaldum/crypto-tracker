import axios from "axios";
import { CryptoProvider } from "./cryptoProvider";
import { Crypto } from 'src/interfaces/Crypto';
import prisma from "src/prismaClient";

export class ApiCryptoProvider extends CryptoProvider {
  
  async addCrypto(userId: string, id: string, name: string, symbol: string, price: number, trend: number): Promise<Crypto> {
    try {
      return await prisma.cryptocurrency.create({
        data: {
          id, 
          user: {
            connect: { id: userId },
          },
          name,
          symbol,
          price,
          trend,
        },
      });
    } catch (error) {
      console.error('Error al agregar la criptomoneda:', error);
      throw new Error('Error al agregar la criptomoneda');
    }
  }

  async getCryptos(): Promise<Crypto[]> { 
    try {
      const response = await axios.get('https://api.coincap.io/v2/assets');
      return response.data.data.map((crypto: any) => ({
        id: crypto.id,
        userId: '', 
        name: crypto.name,
        symbol: crypto.symbol,
        price: parseFloat(crypto.priceUsd) || 0,
        trend: parseFloat(crypto.changePercent24Hr) || 0, 
      }));
    } catch (error) {
      console.error('Error al obtener criptomonedas:', error);
      throw new Error('Error al obtener criptomonedas');
    }
  }

  async getUserCryptos(userId: string): Promise<Crypto[]> { 
    try {
      const cryptos = await prisma.cryptocurrency.findMany({
        where: {
          userId: userId,
        },
      });

      return cryptos.map((crypto) => ({
        id: crypto.id,
        userId: crypto.userId,
        name: crypto.name,
        symbol: crypto.symbol,
        price: crypto.price,
        trend: crypto.trend,
      }));
    } catch (error) {
      console.error('Error al obtener criptomonedas del usuario:', error);
      throw new Error('Error al obtener criptomonedas del usuario');
    }
  }

  async deleteCrypto(cryptoId: string, userId: string): Promise<void> {
    try {
      await prisma.cryptocurrency.delete({
        where: {
          id_userId: {
            id: cryptoId,
            userId: userId,
          }
        }
      });
    } catch (error) {
      console.error('Error al eliminar la criptomoneda:', error);
      throw new Error('Error al eliminar la criptomoneda');
    }
  }

  async getCryptoDetails(id: string, userId: string): Promise<{ crypto: Crypto; priceHistory: any[] }> { 
    try {
      const crypto = await prisma.cryptocurrency.findUnique({
        where: {
          id_userId: {
            id: id,   
            userId: userId,  
          },
        },
      });

      if (!crypto) {
        throw new Error('Criptomoneda no encontrada');
      }

      const historyResponse = await axios.get(`https://api.coincap.io/v2/assets/${id}/history?interval=d1&start=${Date.now() - 6 * 30 * 24 * 60 * 60 * 1000}&end=${Date.now()}`);
      
      return {
        crypto: {
          id: crypto.id,
          userId: crypto.userId, 
          name: crypto.name,
          symbol: crypto.symbol,
          price: crypto.price,
          trend: crypto.trend,
        },
        priceHistory: historyResponse.data.data,
      };
    } catch (error) {
      console.error('Error al obtener detalles de la criptomoneda:', error);
      throw new Error('Error al obtener detalles de la criptomoneda');
    }
  }
}