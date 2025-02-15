import express, { Request, Response } from 'express';
import { GetAllUsers, CreateUser, GetById, AuthUser, UpdateUser, DeleteUser, DeleteManyUsers } from '../controllers/user.controller';
import { db } from '../config/firebase';
import { verifyToken } from "../middlewares/authorization";

export const UserRoutes = express.Router();

const prefix = '/api/v1/users';
UserRoutes.post(`${prefix}/auth`, AuthUser);

UserRoutes.get("/perfil", verifyToken, (req: Request, res: Response) => {
  res.json({ mensaje: "Acceso autorizado", usuario: req.user });
});

UserRoutes.get("/roles", async (req: Request, res: Response) => {
  try {
    const findRoles = (await db.collection('roles').get());
    const roles = findRoles.docs.map(rol => ({ id: rol.id, ...rol.data() }));
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

UserRoutes.get(`${prefix}/getall`, GetAllUsers);
UserRoutes.post(`${prefix}/create`, CreateUser);
UserRoutes.get(`${prefix}/get/:id`, GetById);
UserRoutes.put(`${prefix}/update`, UpdateUser);
UserRoutes.delete(`${prefix}/delete/:id`, DeleteUser);
UserRoutes.delete(`${prefix}/deleteMany`, DeleteManyUsers);
