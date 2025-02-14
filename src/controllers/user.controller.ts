import { DtoToken } from "../model/doc/token";
import { getAllUsers, createUser, getById, authUser, updateUser, deleteUser } from "../services/users.service";
import { Request, Response } from "express";
import CryptoJS from "crypto-js";
import "dotenv/config";

export const AuthUser = async (req: Request, res: Response) => {
  const { name, password } = req.body;
  const dtoToken: DtoToken = {
    password,
    name
  }

  try {
    const token = await authUser(dtoToken);
    res.status(200).json(token);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const CreateUser = async (req: Request, res: Response) => {
  const { collection, data } = req.body;
  try {
    const userCreate = await createUser(data);
    res.status(200).json({
      "Message": "Created user suscessfull",
      "User": userCreate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let user = req.body.data;
    if (process.env.SECRET_KEY && user.password) {
      user = {
        ...user,
        password: CryptoJS.AES.encrypt(user.password, process.env.SECRET_KEY).toString()
      };
    }
    const userUpdate = await updateUser(id, user);
    res.status(200).json({
      "Message": "Updated user suscessfull",
      "User": userUpdate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userDelete = await deleteUser(id);
    res.status(200).send(userDelete);
  } catch (error) {

  }
}

export const GetById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userToFind = await getById(id);
    res.status(200).json({ "User finded": userToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

