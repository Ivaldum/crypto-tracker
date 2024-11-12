import express from 'express';
import { CryptoController } from '../controllers/cryptoController';
import { verifyToken } from 'src/middleware/authMiddleware';
import { ApiCryptoProvider } from 'src/providers/ApiCryptoProvider';

const router = express.Router();
const cryptoController = new CryptoController(new ApiCryptoProvider());

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

export default router;
