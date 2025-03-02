import express from 'express';
import { register, login, requestPasswordReset, resetPassword } from '../controllers/authController'; // Importa la función requestPasswordReset
import { verifyToken } from 'src/middleware/authMiddleware';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/requestPasswordReset', verifyToken, requestPasswordReset); // Ruta para enviar el correo de restablecimiento
router.post('/resetPassword', resetPassword);

export default router;
