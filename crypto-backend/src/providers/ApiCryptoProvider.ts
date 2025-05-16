import axios from "axios";
import { CryptoProvider } from "./cryptoProvider";
import { Crypto } from 'src/interfaces/Crypto';
import prisma from "src/prismaClient";
import logger from "src/utils/logger";
import { CryptoAlert } from 'src/interfaces/CryptoAlert';
import { EmailService } from '../utils/emailService';

export class ApiCryptoProvider extends CryptoProvider {
    private emailService: EmailService;
    private apiKey: string;
    private apiBaseUrl: string;
    

    constructor() {
        super();
        this.emailService = new EmailService();
        this.apiKey = '66bb38c643960e7948541eb2afd961201c06ad4d2d69e6a2ea72c7f89ed0a611';
        this.apiBaseUrl = 'https://rest.coincap.io/v3';
        axios.interceptors.request.use(config => {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${this.apiKey}`;
            return config;
        });
        
    }

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
            logger.error(`Error al agregar la criptomoneda para el usuario ${userId}: ${error}`);
            throw new Error('Error al agregar la criptomoneda');
        }
    }

    async getCryptos(): Promise<Crypto[]> { 
        console.log(`${this.apiBaseUrl}/assets`)
        try {
            const response = await axios.get(`${this.apiBaseUrl}/assets`);
            console.log(`${this.apiBaseUrl}/assets`)
            console.log('Respuesta CoinCap API:', JSON.stringify(response.data, null, 2));
    
            if (response.data && Array.isArray(response.data.data)) {
                return response.data.data.map((crypto: any) => ({
                    id: crypto.id,
                    userId: '', 
                    name: crypto.name,
                    symbol: crypto.symbol,
                    price: parseFloat(crypto.priceUsd) || 0,
                    trend: parseFloat(crypto.changePercent24Hr) || 0, 
                }));
            } else {
                logger.error('La respuesta de la API no tiene la estructura esperada:', response.data);
                throw new Error('Error al obtener criptomonedas: estructura de respuesta inesperada');
            }
        } catch (error) {
            logger.error(`Error al obtener criptomonedas de la API externa: ${error}`);
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
            logger.info(`Criptomonedas obtenidas para el usuario ${userId}`)
            return cryptos.map((crypto) => ({
                id: crypto.id,
                userId: crypto.userId,
                name: crypto.name,
                symbol: crypto.symbol,
                price: crypto.price,
                trend: crypto.trend,
            }));
        } catch (error) {
            logger.error(`Error al obtener criptomonedas del usuario ${userId}: ${error}`);
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
            logger.info(`Criptomoneda eliminada para el usuario ${userId}: ID ${cryptoId}`);
        } catch (error) {
            logger.error(`Error al eliminar la criptomoneda para el usuario ${userId}: ${error}`);
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
                logger.warn(`Criptomoneda no encontrada para el usuario ${userId}: ID ${id}`);
                throw new Error('Criptomoneda no encontrada');
            }

            // historial de precios (últimos 6 meses)
            const endTime = Date.now();
            const startTime = endTime - 6 * 30 * 24 * 60 * 60 * 1000;
            const historyResponse = await axios.get(
                `${this.apiBaseUrl}/assets/${id}/history`, {
                    params: {
                        interval: 'd1',
                        start: startTime,
                        end: endTime
                    }
                }
            );
            
            logger.info(`Detalles de la criptomoneda obtenidos para el usuario ${userId}: ${crypto.name}`);
            
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
            logger.error(`Error al obtener detalles de la criptomoneda para el usuario ${userId}: ${error}`);
            throw new Error('Error al obtener detalles de la criptomoneda');
        }
    }

    async createAlert(userId: string, cryptoId: string, thresholdPercentage: number, alertType: 'up' | 'down'): Promise<CryptoAlert> {
        try {
            const alert = await prisma.cryptoAlert.create({
                data: {
                    userId,
                    cryptoId,
                    thresholdPercentage,
                    alertType,
                }
            });

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });
    
            if (user?.email) {
                await this.emailService.sendAlertEmail(
                    user.email,
                    cryptoId,
                    0,
                    thresholdPercentage,
                    true,
                    alertType
                );
            }
    
            return alert;
        } catch (error) {
            logger.error(`Error al crear alerta para el usuario ${userId}: ${error}`);
            throw new Error('Error al crear la alerta');
        }
    }
    

    async getUserAlerts(userId: string): Promise<CryptoAlert[]> {
        try {
            return await prisma.cryptoAlert.findMany({
                where: { userId, isActive: true },
                include: { cryptocurrency: true }
            });
        } catch (error) {
            logger.error(`Error al obtener alertas del usuario ${userId}: ${error}`);
            throw new Error('Error al obtener las alertas');
        }
    }

    async deleteAlert(alertId: string, userId: string): Promise<void> {
        try {
            await prisma.cryptoAlert.delete({
                where: {
                    id: alertId,
                    userId: userId
                }
            });
        } catch (error) {
            logger.error(`Error al eliminar alerta ${alertId}: ${error}`);
            throw new Error('Error al eliminar la alerta');
        }
    }

    async checkAlerts(): Promise<void> {
        try {
            const activeAlerts = await prisma.cryptoAlert.findMany({
                where: { isActive: true },
                include: { cryptocurrency: true, user: true }
            });
    
            for (const alert of activeAlerts) {
                try {
                    const currentPrice = await this.getCurrentPrice(alert.cryptoId);
                    const originalPrice = alert.cryptocurrency.price;
                    const priceChange = ((currentPrice - originalPrice) / originalPrice) * 100;
    
                    const isTriggered = alert.alertType === 'up' 
                        ? priceChange >= alert.thresholdPercentage 
                        : priceChange <= -alert.thresholdPercentage; 
    
                    if (isTriggered) {
                        await this.handleAlert(alert, currentPrice, alert.user);
    
                        // Actualizar el precio almacenado para futuras comparaciones
                        await prisma.cryptocurrency.update({
                            where: { 
                                id_userId: { 
                                    id: alert.cryptoId, 
                                    userId: alert.userId 
                                } 
                            },
                            data: { price: currentPrice }
                        });
                    }
                } catch (errorProcesamientoAlerta) {
                    logger.error(`Error procesando alerta para cripto ${alert.cryptoId}: ${errorProcesamientoAlerta}`);
                    continue;
                }
            }
        } catch (error) {
            logger.error(`Error verificando alertas: ${error}`);
            throw new Error('Error verificando alertas');
        }
    }

    async updateAlert(alertId: string, userId: string, updates: { isActive?: boolean, thresholdPercentage?: number, alertType?: 'up' | 'down' }): Promise<CryptoAlert> {
        try {
            return await prisma.cryptoAlert.update({
                where: { id: alertId, userId: userId },
                data: updates
            });
        } catch (error) {
            logger.error(`Error al actualizar alerta ${alertId}: ${error}`);
            throw new Error('Error al actualizar la alerta');
        }
    }

    private async getCurrentPrice(cryptoId: string): Promise<number> {
        const response = await axios.get(`${this.apiBaseUrl}/assets/${cryptoId}`);
        return parseFloat(response.data.data.priceUsd);
    }

    private async handleAlert(alert: any, currentPrice: number, user: any) {
        try {
            await prisma.alertHistory.create({
                data: {
                    alertId: alert.id,
                    userId: alert.userId,
                    price: currentPrice,
                }
            });

            await this.emailService.sendAlertEmail(
                user.email,
                alert.cryptocurrency.name,
                currentPrice,
                alert.thresholdPercentage,
                false,
                alert.alertType
            );

        } catch (error) {
            logger.error(`Error procesando alerta: ${error}`);
        }
    }
}