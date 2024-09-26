import express from 'express';
import { getCryptos, addCrypto } from '../controllers/cryptoController';
import { verifyToken } from 'src/middleware/authMiddleware';

const router = express.Router();

router.get('/cryptos', verifyToken, getCryptos);
router.post('/cryptos', verifyToken, addCrypto);

export default router;
