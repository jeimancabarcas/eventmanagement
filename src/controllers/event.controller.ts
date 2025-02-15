import { Request, Response } from "express";
import { createEvent, getAllEvents, getByIdEvent, updateEvent, deleteEvent, deleteManyEvents } from "../services/event.service";
import { EventDto } from "../model/dto/event.dto";

export const CreateEvent = async (req: Request, res: Response) => {
  const eventDto: EventDto = {
    ...req.body
  };

  try {
    const eventCreate = await createEvent(eventDto);
    res.status(200).json({
      "Message": "Evento Creado con éxito",
      "Evento": eventCreate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllEvents = async (req: Request, res: Response) => {
  try {
    const allEvents = await getAllEvents();
    res.status(200).json(allEvents);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetByIdEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await getByIdEvent(id);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateEvent = async (req: Request, res: Response) => {
  const eventDto: EventDto = req.body;
  try {
    const response = await updateEvent(eventDto);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userDelete = await deleteEvent(id);
    res.status(200).send(userDelete);
  } catch (error) {
    res.status(500);
  }
}

export const DeleteManyEvents = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const response = await deleteManyEvents(ids);
    res.status(200).send(response);
  } catch (error) {
    res.status(500);
  }
}