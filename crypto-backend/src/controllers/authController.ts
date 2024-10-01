import { PrismaClient } from '../../node_modules/.prisma/client/default';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {Request, Response} from 'express'

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

// Registro de nuevos usuarios
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, birthDate, dni, email, password } = req.body;

  try {
    // Verificar que la contraseña esté presente antes de encriptarla
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida.' });
    }

    // Encriptar la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 es el número de rondas para generar la sal

    // Crear un nuevo usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        dni,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Usuario registrado con éxito', userId: newUser.id });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(400).json({ error: 'No se pudo registrar el usuario' });
  }
};

// Login usuarios
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  
    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  
    // Generar un token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });
  
    return res.json({ token });
  };
