import { Request, Response, NextFunction } from "express"
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
const admin = require("firebase-admin");

let secretKey = '';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
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
}
