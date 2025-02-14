import { Request, Response, NextFunction } from "express"
import * as jwt from 'jsonwebtoken';
import "dotenv/config";

let secretKey = '';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const autHeader = req.headers['authorization'];
  if (autHeader && autHeader.startsWith('Bearer ')) {
    const token = autHeader.split(' ')[1];
    process.env.SECRET_KEY ? secretKey = process.env.SECRET_KEY : null;
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token Invalido' });
      }
      req.user = decoded;
      next();
    });

  } else {
    res.status(401).json({
      error: "Token no proporcionado"
    })
  }
}
