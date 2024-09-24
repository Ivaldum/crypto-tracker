import { PrismaClient } from '../../node_modules/.prisma/client/default';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {Request, Response} from 'express'

const prisma = new PrismaClient();
const JWT_SECRET = 'clave'

//Registro de usuarios
export const register = async (req: Request, res: Response) => {
    const {email, passsword} = req.body;

    const userExist = await prisma.user.findUnique({where: {email}})

    if (userExist) {
        return res.status(400).json({message: 'User all ready exist'})
    }

    //Encriptacion
    const hashedPassword = await bcrypt.hash(passsword, 10)

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    })

    return res.status(201).json({message: 'User created', userId: newUser.id})
}

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
