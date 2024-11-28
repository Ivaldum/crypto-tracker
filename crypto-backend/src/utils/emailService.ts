import nodemailer from 'nodemailer';
import logger from './logger';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // Por ejemplo: 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

export async function sendEmail(
    to: string,
    subject: string,
    text: string
): Promise<void> {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Email enviado exitosamente a ${to}`);
    } catch (error) {
        logger.error(`Error al enviar email a ${to}: ${error}`);
        throw new Error('Error al enviar email');
    }
}

// Función para enviar email de prueba y verificar la configuración
export async function testEmailConnection(): Promise<boolean> {
    try {
        await transporter.verify();
        logger.info('Conexión de email verificada exitosamente');
        return true;
    } catch (error) {
        logger.error(`Error al verificar conexión de email: ${error}`);
        return false;
    }
}