import express, { Request, Response } from 'express';
import { CreateEvent, GetAllEvents, UpdateEvent, DeleteEvent, GetByIdEvent, DeleteManyEvents, GetComingEvents } from '../controllers/event.controller';

import { verifyToken } from '../middlewares/authorization'

export const EventRoutes = express.Router();

const prefix = '/api/v1/events';
EventRoutes.post(`${prefix}/create`, verifyToken, CreateEvent);
EventRoutes.get(`${prefix}/getall`, verifyToken, GetAllEvents);
EventRoutes.get(`${prefix}/getComingEvents`, verifyToken, GetComingEvents);
EventRoutes.put(`${prefix}/update`, verifyToken, UpdateEvent);
EventRoutes.get(`${prefix}/getById/:id`, verifyToken, GetByIdEvent);
EventRoutes.delete(`${prefix}/delete/:id`, verifyToken, DeleteEvent);
EventRoutes.delete(`${prefix}/deleteMany`, verifyToken, DeleteManyEvents);

