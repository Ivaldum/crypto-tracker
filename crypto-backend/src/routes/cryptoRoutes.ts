import express from 'express';
import { CryptoController } from '../controllers/cryptoController';
import { verifyToken } from 'src/middleware/authMiddleware';
import { ApiCryptoProvider } from 'src/providers/ApiCryptoProvider';
import { AlertController } from '../controllers/alertController';

const router = express.Router();
const cryptoController = new CryptoController(new ApiCryptoProvider());
const alertController = new AlertController(new ApiCryptoProvider());

// Obtener todas las criptomonedas (protegido)
router.get('/cryptos', verifyToken, cryptoController.getCryptos);

// Obtener criptomonedas favoritas del usuario (protegido)
router.get('/cryptos/favorites', verifyToken, cryptoController.getUserCryptos);

// Obtener detalles de una criptomoneda específica (protegido)
router.get('/cryptos/:id', verifyToken, cryptoController.getCryptoDetails);

// Agregar una nueva criptomoneda (protegido)
router.post('/cryptos', verifyToken, cryptoController.addCrypto);

// Eliminar una criptomoneda específica (protegido)
router.delete('/cryptos/:id', verifyToken, cryptoController.deleteCrypto);

// Rutas de alertas 
// Crear una nueva alerta (protegido)
router.post('/alerts', verifyToken, alertController.createAlert);
// Obtener todas las alertas del usuario (protegido)
router.get('/alerts', verifyToken, alertController.getUserAlerts);
// Obtener una alerta específica (protegido)
router.delete('/alerts/:id', verifyToken, alertController.deleteAlert);
// Actualizar una alerta específica (protegido)
router.put('/alerts/:id', verifyToken, alertController.updateAlert);
// Activar/desactivar una alerta específica (protegido)
router.patch('/alerts/:id/toggle', verifyToken, alertController.toggleAlert);
// Comprobar alertas (protegido)
router.get('/alerts/:id/history', verifyToken, alertController.getAlertHistory);
// Comprobar todas las alertas (protegido)
router.get('/alert-history', verifyToken, alertController.getAllAlertHistory);

export default router;
