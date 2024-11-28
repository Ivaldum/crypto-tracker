import cron from 'node-cron';
import { ApiCryptoProvider } from '../providers/ApiCryptoProvider';
import logger from '../utils/logger';

const cryptoProvider = new ApiCryptoProvider();

cron.schedule('*/30 * * * *', async () => {
    try {
        await cryptoProvider.checkAlerts();
        logger.info('Verificación de alertas completada');
    } catch (error) {
        logger.error(`Error en la verificación de alertas: ${error}`);
    }
});