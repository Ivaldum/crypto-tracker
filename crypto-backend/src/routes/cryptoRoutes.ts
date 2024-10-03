import express from 'express';
import { getCryptos, addCrypto, getUserCryptos, deleteCrypto } from '../controllers/cryptoController';
import { verifyToken } from 'src/middleware/authMiddleware';

const router = express.Router();

router.get('/cryptos', verifyToken, getCryptos);
router.get('/cryptos', verifyToken, getUserCryptos);
router.post('/cryptos', verifyToken, addCrypto);
router.delete('/cryptos/:id', verifyToken, deleteCrypto);

export default router;
