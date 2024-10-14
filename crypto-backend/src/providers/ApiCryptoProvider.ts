import axios from "axios";
import { CryptoProvider } from "./cryptoProvider";
import prisma from "src/prismaClient";

export class ApiCryptoProvider extends CryptoProvider {

    async addCrypto(userId: string, id: string, name: string, symbol: string, price: number, trend: number): Promise<any> {
        try {
            console.log({
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
              })
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
            console.error('Error al agregar la cryptomoneda:', error);
            throw new Error('Error al agregar la cryptomoneda');
        }
    }

    async getCryptos(): Promise<any[]> {
        try {
            const response = await axios.get('https://api.coincap.io/v2/assets');
            const cryptos = response.data.data.map((crypto: any) => ({
              id: crypto.id,
              name: crypto.name,
              symbol: crypto.symbol,
              price: parseFloat(crypto.priceUsd) || 0,
              changePercent24Hr: parseFloat(crypto.changePercent24Hr) || 0,
            }));
            return cryptos;
          } catch (error) {
            console.error('Error al obtener criptomonedas:', error);
            throw new Error('Error al obtener criptomonedas');
          }
    }

    async getUserCryptos(userId: string): Promise<any[]> {
        try {
            const cryptos = await prisma.cryptocurrency.findMany({
                where: {
                    userId: userId,
                },
            });
            return cryptos;
        } catch (error) {
            console.error('Error al obtener criptomonedas del usuario:', error);
            throw new Error('Error al obtener criptomonedas del usuario');
        }
    }

    async deleteCrypto(cryptoId: string, userId: string): Promise<void> {
        try{
            await prisma.cryptocurrency.delete({
                where: {
                    id_userId: {
                        id: cryptoId,
                        userId: userId,
                  }
                }
              });
        } catch (error) {
            console.error('Error al eliminar la cryptomoneda:', error);
            throw new Error('Error al eliminar la cryptomoneda:');
        }
    }

    async getCryptoDetails(id: string): Promise<any> {
        try{
            const historyResponse = await axios.get(`https://api.coincap.io/v2/assets/${id}/history?interval=d1&start=${Date.now() - 6 * 30 * 24 * 60 * 60 * 1000}&end=${Date.now()}`);
            
            return {
                ...crypto,
                priceHistory: historyResponse.data.data,
            };

        } catch (error) {

        }
    }
}