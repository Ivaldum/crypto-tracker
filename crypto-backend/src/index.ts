import express from 'express'
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes'
import cryptoRoutes from './routes/cryptoRoutes';

const app = express();
const prisma = new PrismaClient();

app.use(express.json())

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas de criptomonedas (panel de seguimiento)
app.use('/api', cryptoRoutes);

//Obtener cryptomonedas 
app.get('/crypto', async (req, res) => {
    const cryptos = await prisma.cryptocurrency.findMany();
    res.json(cryptos)
})

//Agregar nueva cryptomoneda 
app.post('/cryptos', async (req, res) => {
    const {name, symbol, price, trend } = req.body;
    const newCrypto = await prisma.cryptocurrency.create({
        data: {name, symbol, price, trend}
    });
    res.json(newCrypto)
})

const PORT = 3001;

app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`)
})