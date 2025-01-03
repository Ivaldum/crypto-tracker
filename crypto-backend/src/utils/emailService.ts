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
        if (!to || !cryptoName || currentPrice === undefined || thresholdPercentage === undefined) {
            throw new Error('Todos los parámetros son requeridos');
        }

        if (!this.isValidEmail(to)) {
            throw new Error('Dirección de email inválida');
        }

        try {
            const formattedPrice = new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'USD'
            }).format(currentPrice);

            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject: `Alerta de Precio - ${cryptoName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">Alerta de Cambio de Precio</h1>
                        <p>Se ha detectado un cambio significativo en el precio de <strong>${cryptoName}</strong>.</p>
                        <p>Precio actual: ${formattedPrice}</p>
                        <p>Umbral configurado: ${thresholdPercentage}%</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">Este es un mensaje automático, por favor no responder.</p>
                    </div>
                `
            });
            logger.info(`Alerta enviada por email para ${cryptoName} a ${to}`);
        } catch (error) {
            logger.error(`Error enviando email: ${error}`);
            throw error;
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}