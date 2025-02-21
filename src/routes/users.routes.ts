import express, { Request, Response } from 'express';
import { GetAllUsers, CreateUser, GetById, UpdateUser, DeleteUser, DeleteManyUsers, GetByRole } from '../controllers/user.controller';
import { db } from '../config/firebase';
import { checkRole, verifyToken } from "../middlewares/authorization";

export const UserRoutes = express.Router();

const prefix = '/api/v1/users';


UserRoutes.get(`${prefix}/getall`, verifyToken, checkRole(["ADMIN"]), GetAllUsers);
UserRoutes.get(`${prefix}/getByRole/:role`, verifyToken, checkRole(["ADMIN"]), GetByRole);
UserRoutes.post(`${prefix}/create`, verifyToken, checkRole(["ADMIN"]), CreateUser);
UserRoutes.get(`${prefix}/get/:id`, verifyToken, checkRole(["ADMIN"]), GetById);
UserRoutes.put(`${prefix}/update`, verifyToken, checkRole(["ADMIN"]), UpdateUser);
UserRoutes.delete(`${prefix}/delete/:id`, verifyToken, checkRole(["ADMIN"]), DeleteUser);
UserRoutes.delete(`${prefix}/deleteMany`, verifyToken, checkRole(["ADMIN"]), DeleteManyUsers);
