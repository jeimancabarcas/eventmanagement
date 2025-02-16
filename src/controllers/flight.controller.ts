import { Request, Response } from "express";
import { FlightDto } from "../model/dto/flight.dto";
import { createFlight, deleteFlight, deleteManyFlights, getAllFights, getByIdFlight, updateFlight } from "../services/fligh.service";
import { FlightDoc } from "src/model/doc/flight.doc";

export const CreateFlight = async (req: Request, res: Response) => {
  const { departure, destination, departureTime, arrivalTime, airline, flightNumber} = req.body;
  const flightDoc: FlightDto = {
    ...req.body
  };
  try {
    const response = await createFlight({...flightDoc });
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllFlights = async (req: Request, res: Response) => {
  try {
    const response = await getAllFights();
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}
export const GetByIdFlight = async (req: Request, res: Response) => {
  const { userId, flightId } = req.params;
  try {
    const response = await getByIdFlight(userId, flightId);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateFlight = async (req: Request, res: Response) => {
  const flightDto: FlightDto = req.body;
  try {
    const response = await updateFlight(flightDto);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteFlight = async (req: Request, res: Response) => {
  const { userId, flightId } = req.params;
  try {
    const response = await deleteFlight(userId, flightId);
    res.status(200).send(response);
  } catch (error) {
    res.status(500);
  }
}

export const DeleteManyFlight = async (req: Request, res: Response) => {
  try {
    const response = await deleteManyFlights(req.body);
    res.status(200).send(response);
  } catch (error) {
    res.status(500);
  }
}