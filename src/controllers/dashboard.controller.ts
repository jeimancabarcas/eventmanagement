import { Request, Response } from "express";
import { getStaffDashboard, getStats, getUsersWithoutActiveEvents } from "../services/dashboard.service";
const admin = require("firebase-admin");


export interface StatsDto {
    eventsRegistered: number,
    staffHired: number,
    staffHiredWithActiveEvents: number,
    totalActiveEvents: number,
    totalClosedEvents: number,
    totalHotelExpensesForActiveEvents:number,
    totalHotelExpensesForClosedEvents:number,
    totalFlightExpensesForActiveEvents:number,
    totalFlightExpensesForClosedEvents:number,
}

export const GetStats = async (req: Request, res: Response) => {
  try {
    const response = await getStats();
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetUsersWithoutActiveEvents = async (req: Request, res: Response) => {
  try {
    const response = await getUsersWithoutActiveEvents();
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetStaffDashboard = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader?.split(' ')[1]; // Extrae el token eliminando "Bearer "

    // 🔹 Verificar y decodificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid; // 🔥 Aquí obtenemos el UID del usuario autenticado

    const response = await getStaffDashboard(uid);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}