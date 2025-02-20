import { Request, Response, NextFunction } from "express"
import "dotenv/config";
const admin = require("firebase-admin");


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const autHeader = req.headers['authorization'];
    if (autHeader && autHeader.startsWith('Bearer ')) {

      const token = autHeader.split(' ')[1];
      if(await admin.auth().verifyIdToken(token)) {
        next();
      }else {
        res.status(403).json({ message: 'Invalid Token' });
      }
    } else {
      res.status(401).json({
        error: "Token not found"
      })
    }
  } catch (error) {
    res.status(401).json({
      error: "Token invalid or expired"
    })
  }
}
