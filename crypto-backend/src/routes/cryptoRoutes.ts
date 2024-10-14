import express from 'express';
import { CryptoController } from '../controllers/cryptoController';
import { verifyToken } from 'src/middleware/authMiddleware';
import { ApiCryptoProvider } from 'src/providers/ApiCryptoProvider';

const router = express.Router();

const cryptoController = new CryptoController(new ApiCryptoProvider());


// Ruta para obtener todas las criptomonedas en la base de datos.
// Esta ruta está protegida y requiere un token de autenticación.
// Llama a la función 'getCryptos' que recupera todas las criptomonedas guardadas en la base de datos para el usuario autenticado.
router.get('/cryptos', verifyToken, cryptoController.getCryptos);

// Ruta para obtener las criptomonedas favoritas de un usuario.
// Esta ruta está protegida y también requiere un token de autenticación.
// Llama a la función 'getUserCryptos' que recupera las criptomonedas favoritas específicas del usuario autenticado.
router.get('/cryptos/favorites', verifyToken, cryptoController.getUserCryptos);

// Ruta para obtener los detalles de una criptomoneda específica usando su ID.
// Esta ruta está protegida y requiere un token de autenticación.
// Llama a la función 'getCryptoDetails' que obtiene tanto los detalles de la criptomoneda como su historial de precios.
router.get('/api/cryptos/:id', verifyToken, cryptoController.getCryptoDetails);

// Ruta para agregar una nueva criptomoneda a la base de datos.
// Esta ruta está protegida y requiere un token de autenticación.
// Llama a la función 'addCrypto' para crear una nueva criptomoneda para el usuario autenticado.
router.post('/cryptos', verifyToken, cryptoController.addCrypto);

// Ruta para eliminar una criptomoneda específica usando su ID.
// Esta ruta está protegida y también requiere un token de autenticación.
// Llama a la función 'deleteCrypto' para eliminar la criptomoneda correspondiente del usuario autenticado.
router.delete('/cryptos/:id', verifyToken, cryptoController.deleteCrypto);

export default router;
