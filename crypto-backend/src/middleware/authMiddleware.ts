import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Esta clave secreta debería estar almacenada en un archivo de configuración o variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Verificar si el token está en los headers

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado: no se proporcionó el token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar el token
    req.userId = decoded.userId; // Pasar el userId al siguiente middleware
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};
