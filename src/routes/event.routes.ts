import express, { Request, Response } from 'express';
import { CreateEvent, GetAllEvents, UpdateEvent, DeleteEvent, GetByIdEvent, DeleteManyEvents, GetComingEvents } from '../controllers/event.controller';

import { checkRole, verifyToken } from '../middlewares/authorization'

export const EventRoutes = express.Router();

const prefix = '/api/v1/events';
EventRoutes.post(`${prefix}/create`, verifyToken,  checkRole(["ADMIN"]),CreateEvent);
EventRoutes.get(`${prefix}/getall`, verifyToken, checkRole(["ADMIN"]), GetAllEvents);
EventRoutes.get(`${prefix}/getComingEvents`, verifyToken, checkRole(["ADMIN"]), GetComingEvents);
EventRoutes.put(`${prefix}/update`, verifyToken, checkRole(["ADMIN"]), UpdateEvent);
EventRoutes.get(`${prefix}/getById/:id`, verifyToken, checkRole(["ADMIN"]), GetByIdEvent);
EventRoutes.delete(`${prefix}/delete/:id`, verifyToken, checkRole(["ADMIN"]), DeleteEvent);
EventRoutes.delete(`${prefix}/deleteMany`, verifyToken, checkRole(["ADMIN"]), DeleteManyEvents);

