import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });
    }

    async sendAlertEmail(
        email: string, 
        cryptoName: string, 
        currentPrice: number, 
        threshold: number, 
        isCreation: boolean,
        priceChangePercent?: string,
        initialPrice?: number
    ): Promise<void> {
        try {
            let subject, html;

            if (isCreation) {
                subject = `Nueva alerta configurada para ${cryptoName}`;
                html = `
                    <h2>Nueva alerta de criptomoneda configurada</h2>
                    <p>Has configurado una nueva alerta para <strong>${cryptoName}</strong>.</p>
                    <p>Precio inicial: $${currentPrice.toFixed(2)}</p>
                    <p>Te notificaremos cuando el precio cambie en ±${threshold}%.</p>
                `;
            } else {
                const initialPriceDisplay = initialPrice 
                    ? `$${initialPrice.toFixed(2)}`
                    : 'No disponible';
                
                let priceDifference = '';
                if (initialPrice) {
                    const diff = currentPrice - initialPrice;
                    const sign = diff >= 0 ? '+' : '';
                    priceDifference = `<p>Diferencia: ${sign}$${diff.toFixed(2)}</p>`;
                }

                subject = `¡Alerta! Cambio significativo en el precio de ${cryptoName}`;
                html = `
                    <h2>Alerta de cambio de precio</h2>
                    <p>La criptomoneda <strong>${cryptoName}</strong> ha experimentado un cambio significativo en su precio.</p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                        <p><strong>Precio inicial:</strong> ${initialPriceDisplay}</p>
                        <p><strong>Precio actual:</strong> $${currentPrice.toFixed(2)}</p>
                        ${priceDifference}
                        <p><strong>Cambio porcentual:</strong> ${priceChangePercent || 'significativo'}%</p>
                    </div>
                    <p>Este cambio ha superado el umbral de ±${threshold}% que configuraste.</p>
                `;
            }

            await this.transporter.sendMail({
                from: `"Crypto Alerts" <${process.env.EMAIL_USER}>`,
                to: email,
                subject,
                html,
            });

            logger.info(`Email de alerta enviado a ${email} para ${cryptoName}`);
        } catch (error) {
            logger.error(`Error al enviar email de alerta: ${error}`);
        }
    }
}