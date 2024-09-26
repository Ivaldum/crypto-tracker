import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Esta clave secreta debería estar almacenada en un archivo de configuración o variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó ningún token.' });
  }

  const token = authHeader.split(' ')[1]; // Esperamos el token en el formato "Bearer <token>"

  try {
    // Verificamos y decodificamos el token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    (req as any).userId = decoded.userId; // Almacenamos el userId decodificado en el objeto `req` para su uso posterior
    next(); // Continuamos hacia el siguiente middleware o ruta
  } catch (error) {
    return res.status(403).json({ error: 'Token no válido.' });
  }
};
