import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import cryptoRoutes from './routes/cryptoRoutes';
import { verifyToken } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const prisma = new PrismaClient();

// Configurar CORS para permitir solo solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:5173',  // Restringe a tu frontend
  credentials: true,
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas de criptomonedas protegidas por el middleware de verificación de token
app.use('/api', verifyToken, cryptoRoutes);

// Manejador global de errores
app.use(errorHandler);

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});