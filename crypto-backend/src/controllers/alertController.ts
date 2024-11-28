import { Request, Response } from 'express';
import { CryptoProvider } from 'src/providers/cryptoProvider';
import logger from 'src/utils/logger';

export class AlertController {
    constructor(private cryptoProvider: CryptoProvider) {}

    createAlert = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const { cryptoId, thresholdPercentage } = req.body;

        try {
            const alert = await this.cryptoProvider.createAlert(
                userId,
                cryptoId,
                thresholdPercentage
            );
            logger.info(`Alerta creada para usuario ${userId}, crypto ${cryptoId}`);
            res.status(201).json(alert);
        } catch (error) {
            logger.error(`Error al crear alerta: ${error}`);
            res.status(500).json({ error: 'Error al crear la alerta' });
        }
    };

    getUserAlerts = async (req: Request, res: Response) => {
        const userId = res.locals.userId;

        try {
            const alerts = await this.cryptoProvider.getUserAlerts(userId);
            res.status(200).json(alerts);
        } catch (error) {
            logger.error(`Error al obtener alertas: ${error}`);
            res.status(500).json({ error: 'Error al obtener las alertas' });
        }
    };

    deleteAlert = async (req: Request, res: Response) => {
        const userId = res.locals.userId;
        const alertId = req.params.id;

        try {
            await this.cryptoProvider.deleteAlert(alertId, userId);
            res.status(204).send();
        } catch (error) {
            logger.error(`Error al eliminar alerta: ${error}`);
            res.status(500).json({ error: 'Error al eliminar la alerta' });
        }
    };
}