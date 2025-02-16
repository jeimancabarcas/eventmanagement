import { Request, Response } from "express";
import { getStats, getUsersWithoutActiveEvents } from "../services/dashboard.service";

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