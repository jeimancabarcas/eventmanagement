import { Request, Response, NextFunction } from "express"
import "dotenv/config";
const admin = require("firebase-admin");
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      if (decodedToken) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || "user", // Si no tiene rol, asignamos "user" por defecto
        };
        next();
      } else {
        res.status(403).json({ message: 'Invalid Token' });
      }
    } else {
      res.status(401).json({ error: "Token not found" });
    }
  } catch (error) {
    res.status(401).json({ error: "Token invalid or expired" });
  }
};

export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user || (req.user.role && !allowedRoles.includes(req.user.role))) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    return next();
  };
};