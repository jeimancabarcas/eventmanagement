import express, { Request, Response } from 'express';
import { CreateEvent, GetAllEvents, UpdateEvent, DeleteEvent, GetByIdEvent, DeleteManyEvents } from '../controllers/event.controller';
import { updateEvent } from 'src/services/event.service';

export const EventRoutes = express.Router();

const prefix = '/api/v1/events';
EventRoutes.post(`${prefix}/create`, CreateEvent);
EventRoutes.get(`${prefix}/getall`, GetAllEvents);
EventRoutes.put(`${prefix}/update/:id`, UpdateEvent);
EventRoutes.get(`${prefix}/getById/:id`, GetByIdEvent);
EventRoutes.delete(`${prefix}/delete/:id`, DeleteEvent);
EventRoutes.delete(`${prefix}/deleteMany`, DeleteManyEvents);

