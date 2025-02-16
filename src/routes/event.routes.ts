import express, { Request, Response } from 'express';
import { CreateEvent, GetAllEvents, UpdateEvent, DeleteEvent, GetByIdEvent, DeleteManyEvents, GetComingEvents } from '../controllers/event.controller';

export const EventRoutes = express.Router();

const prefix = '/api/v1/events';
EventRoutes.post(`${prefix}/create`, CreateEvent);
EventRoutes.get(`${prefix}/getall`, GetAllEvents);
EventRoutes.get(`${prefix}/getComingEvents`, GetComingEvents);
EventRoutes.put(`${prefix}/update`, UpdateEvent);
EventRoutes.get(`${prefix}/getById/:id`, GetByIdEvent);
EventRoutes.delete(`${prefix}/delete/:id`, DeleteEvent);
EventRoutes.delete(`${prefix}/deleteMany`, DeleteManyEvents);

