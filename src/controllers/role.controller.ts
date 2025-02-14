import { Request, Response } from "express";
import { createRole, deleteRole, getAllRoles, getByIdRole, updateRole } from "../services/role.service";

export const CreateRole = async (req: Request, res: Response) => {
  const { data } = req.body;
  try {
    const roleCreate = await createRole(data);
    res.status(200).json({
      "Message": "Created suscessfull role",
      "Evento": roleCreate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllRoles = async (req: Request, res: Response) => {
  try {
    const allRoles = await getAllRoles();
    res.status(200).json(allRoles);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetByIdRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const roleToFind = await getByIdRole(id);
    res.status(200).json({ "Role finded": roleToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const roleUpdate = await updateRole(id, data);
    res.status(200).json({
      "Message": "Updated role suscessfull",
      "User": roleUpdate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const roleDelete = await deleteRole(id);
    res.status(200).send(roleDelete);
  } catch (error) {

  }
}