import express from 'express'
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes'
import cryptoRoutes from './routes/cryptoRoutes';
import { verifyToken } from './middleware/authMiddleware';

const app = express();
const prisma = new PrismaClient();

app.use(express.json())

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas de criptomonedas (panel de seguimiento)
app.use('/api', verifyToken, cryptoRoutes);

//Obtener cryptomonedas 
app.get('/crypto', async (req, res) => {
    const cryptos = await prisma.cryptocurrency.findMany();
    res.json(cryptos)
})

app.post('/api/cryptos', async (req, res) => {
    const { name, symbol, price, trend } = req.body;
    const userId = (req as any).userId;
  
    try {
      const newCrypto = await prisma.cryptocurrency.create({
        data: {
          name,
          symbol,
          price,
          trend,
          user: {
            connect: { id: userId },
          },
        },
      });
      res.status(201).json(newCrypto);
    } catch (error) {
      console.error('Error al crear la criptomoneda:', error);
      res.status(500).json({ error: 'No se pudo crear la criptomoneda.' });
    }
  });

const PORT = 3001;

app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`)
})