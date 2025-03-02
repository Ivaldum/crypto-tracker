import { PrismaClient } from '../../node_modules/.prisma/client/default';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {Request, Response} from 'express'
import { EmailService } from '../utils/emailService';
import logger from 'src/utils/logger';
import { error } from 'console';


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';
const emailService = new EmailService();  // Crea la instancia aquí



export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, birthDate, dni, email, password } = req.body;

  try {
 
    if (!firstName || !lastName || !dni || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de correo electrónico inválido' });
    }

    if (isNaN(Date.parse(birthDate)) || new Date(birthDate) > new Date()) {
      return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
  } catch (error: any) {
    console.error('Error en el registro:', error);

    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'El formato del email no es válido' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  // 1. Obtener el userId del middleware de autenticación
  const userId = res.locals.userId; // Esto debe estar disponible si se ha pasado por el middleware `verifyToken`

  if (!userId) {
    return res.status(400).json({ error: 'Usuario no autenticado' });
  }

  try {
    // 2. Buscar el usuario en la base de datos usando el userId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // 3. Generar el token de restablecimiento
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET);

    // 4. Guardar el token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken }
    });

    // 5. Crear el enlace de restablecimiento y enviarlo por correo electrónico
    const resetLink = `${process.env.FRONTEND_URL}/NewPassword?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink);
    
    res.json({ message: 'Correo de restablecimiento enviado' });
  } catch (error) {
    console.error('Error en solicitud de restablecimiento:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
  logger.error(error)
};


// 2. Restablecer la contraseña
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }
  
  if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  
  try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      
      if (!user || user.resetToken !== token) {
          return res.status(400).json({ error: 'Token inválido o expirado' });

          
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword, resetToken: null } // Eliminamos el token una vez usado
      });
      
      res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ error: 'Error en el servidor' });
      
  }
  
};