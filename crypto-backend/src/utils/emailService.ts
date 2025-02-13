import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendAlertEmail(to: string, cryptoName: string, currentPrice: number, thresholdPercentage: number) {
        const MAX_REINTENTOS = 3;
        let reintentos = 0;
    
        while (reintentos < MAX_REINTENTOS) {
            try {
                await this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                    to,
                    subject: `Alerta de Precio - ${cryptoName}`,
                    html: `
                        <h1>Alerta de Cambio de Precio</h1>
                        <p>Se ha detectado un cambio significativo en el precio de ${cryptoName}.</p>
                        <p>Precio actual: $${currentPrice.toFixed(2)}</p>
                        <p>Umbral configurado: ${thresholdPercentage}%</p>
                        <p>Este es un mensaje automático, por favor no responder.</p>
                    `
                });
                logger.info(`Alerta enviada por email para ${cryptoName}`);
                return;
            } catch (error) {
                reintentos++;
                logger.warn(`Intento de envío de email ${reintentos} fallido: ${error}`);
                
                if (reintentos >= MAX_REINTENTOS) {
                    logger.error(`Fallo al enviar email después de ${MAX_REINTENTOS} intentos`);
                    throw error;
                }
                
                // Esperar antes de reintentar
                await new Promise(resolve => setTimeout(resolve, 1000 * reintentos));
            }
        }
    }
}