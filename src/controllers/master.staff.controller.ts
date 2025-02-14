import { Request, Response } from "express";
import { createMasterStaff, deleteMasterStaff, getAllMasterStaff, getByIdMasterStaff, updateMasterStaff } from "../services/master.staff.service";
import { MasterLogisticsStaffDto } from "../model/dto/master.staff.dto";

export const CreateMasterStaff = async (req: Request, res: Response) => {
  const { data } = req.body;
  const newMasterLogistics: MasterLogisticsStaffDto = {
    ...data,
    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toDateString() : null
  }
  try {
    const masterLogisticsCreated = await createMasterStaff(newMasterLogistics);
    res.status(200).json({
      "Message": "MasterLogistics Created suscessfull",
      "MasterLogistic": masterLogisticsCreated
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllMasterLogistics = async (req: Request, res: Response) => {
  try {
    const allMasterLogistics = await getAllMasterStaff();
    res.status(200).json(allMasterLogistics);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetByIdMasterStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const masterToFind = await getByIdMasterStaff(id);
    res.status(200).json({ "MasterLogistic finded": masterToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateMasterStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body;
  let newMasterLogist: MasterLogisticsStaffDto = data;
  if (data.date_of_birth) {
    newMasterLogist = {
      ...data,
      date_of_birth: new Date(data.date_of_birth).toDateString()
    }
  }
  try {
    const masterLogisticsUpdate = await updateMasterStaff(id, newMasterLogist);
    res.status(200).json({
      "Message": "Updated Masterlogistics suscessfull",
      "User": masterLogisticsUpdate
    });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteMasterStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const masterLogisticDelete = await deleteMasterStaff(id);
    res.status(200).send(masterLogisticDelete);
  } catch (error) {

  }

}