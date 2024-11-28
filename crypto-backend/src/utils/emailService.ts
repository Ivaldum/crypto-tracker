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
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject: `Alerta de Precio - ${cryptoName}`,
                html: `
                    <h1>Alerta de Cambio de Precio</h1>
                    <p>Se ha detectado un cambio significativo en el precio de ${cryptoName}.</p>
                    <p>Precio actual: $${currentPrice}</p>
                    <p>Umbral configurado: ${thresholdPercentage}%</p>
                    <p>Este es un mensaje automático, por favor no responder.</p>
                `
            });
            logger.info(`Alerta enviada por email para ${cryptoName}`);
        } catch (error) {
            logger.error(`Error enviando email: ${error}`);
            throw error;
        }
    }
}