import { Request, Response } from "express";
import { createEvent, getAllEvents, getByIdEvent, updateEvent, deleteEvent, deleteManyEvents } from "../services/event.service";
import { EventDto } from "../model/dto/event.dto";

export const CreateEvent = async (req: Request, res: Response) => {
  const eventDto: EventDto = {
    ...req.body
  };

  try {
    const eventCreated = await createEvent(eventDto);
    res.status(200).json({
      "Message": "Evento Creado con éxito",
      "Evento": eventCreated
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
    const eventToFind = await getByIdEvent(id);
    res.status(200).json({ "Event finded": eventToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateEvent = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const eventDto: EventDto = req.body;
  try {
    const eventUpdate = await updateEvent(id, eventDto);
    res.status(200).json({
      "Message": "Updated event suscessfull",
      "Event": eventUpdate
    }
    );
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