import { Request, Response } from "express";
import { FlightDto } from "../model/dto/flight.dto";
import { createFlight, deleteFlight, deleteManyFlights, getAllFights, getByIdFlight, updateFlight } from "../services/fligh.service";
import { FlightDoc } from "src/model/doc/flight.doc";

export const CreateFlight = async (req: Request, res: Response) => {
  const { departure, destination, departureTime, arrivalTime, airline, flightNumber} = req.body;
  const flightDoc: FlightDoc = {
    departure,
    destination,
    departureTime,
    arrivalTime,
    airline,
    flightNumber
  };
  try {
    const flightCreate = await createFlight({...flightDoc });
    res.status(200).json({
      "Message": "Evento Creado con éxito",
      "Evento": flightCreate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllFlights = async (req: Request, res: Response) => {
  try {
    const allFlights = await getAllFights();
    res.status(200).json(allFlights);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetByIdFlight = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const flightToFind = await getByIdFlight(id);
    res.status(200).json({ "Event finded": flightToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateFlight = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const flightDto: FlightDto = req.body;
  try {
    const flightUpdate = await updateFlight(flightDto);
    res.status(200).json({
      "Message": "Updated event suscessfull",
      "Event": flightUpdate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteFlight = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const flightDelete = await deleteFlight(id);
    res.status(200).send(flightDelete);
  } catch (error) {
    res.status(500);
  }
}

export const DeleteManyFlight = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const response = await deleteManyFlights(ids);
    res.status(200).send(response);
  } catch (error) {
    res.status(500);
  }
}