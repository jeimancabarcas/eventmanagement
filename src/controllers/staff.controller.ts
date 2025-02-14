import { StaffDto } from "../model/dto/staff.dto";
import { createLogisticsEvent, deleteLogisticsEvent, getAllLogisticsEvent, getByIdLogisticsEvent, updateLogisticsEvent } from "../services/staff.service";
import { Request, Response } from "express";

export const CreateLogisticsEvent = async (req: Request, res: Response) => {
  const { data } = req.body;
  const { id } = req.params;
  const newLogistics: StaffDto = {
    ...data,
    date_of_birth: new Date(data.date_of_birth).toDateString()
  }
  try {
    const logisticsCreated = await createLogisticsEvent(id, newLogistics);
    res.status(200).json({
      "Message": "Logistics Created suscessfull",
      "Logistic": logisticsCreated
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllLogisticsEvent = async (req: Request, res: Response) => {
  try {
    const allLogistics = await getAllLogisticsEvent();
    res.status(200).json(allLogistics);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}
export const GetByIdLogisticsEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const eventToFind = await getByIdLogisticsEvent(id, data.id);
    res.status(200).json({ "Event finded": eventToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateLogisticsEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body;
  let newLogistEvent: StaffDto = data;
  if (data.date_of_birth) {
    newLogistEvent = {
      ...data,
      date_of_birth: new Date(data.date_of_birth).toDateString()
    }
  }
  try {
    const logisticsUpdate = await updateLogisticsEvent(id, newLogistEvent);
    res.status(200).json({
      "Message": "Updated logistics suscessfull",
      "User": logisticsUpdate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message); Event
  }
}

export const DeleteLogisticsEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const deleteLogistic = await deleteLogisticsEvent(id, data.id);
    res.status(200).json(deleteLogistic);
  } catch (error) {

  }
}