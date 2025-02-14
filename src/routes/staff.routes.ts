import express from 'express';
import { CreateLogisticsEvent, DeleteLogisticsEvent, GetAllLogisticsEvent, GetByIdLogisticsEvent, UpdateLogisticsEvent } from '../controllers/staff.controller';

export const EventLogisticsRoutes = express.Router();

const prefix = '/api/v1/eventlogistics';
EventLogisticsRoutes.post(`${prefix}/create/:id`, CreateLogisticsEvent);
EventLogisticsRoutes.get(`${prefix}/getall`, GetAllLogisticsEvent);
EventLogisticsRoutes.put(`${prefix}/update/:id`, UpdateLogisticsEvent);
EventLogisticsRoutes.get(`${prefix}/getById/:id`, GetByIdLogisticsEvent);
EventLogisticsRoutes.delete(`${prefix}/delete/:id`, DeleteLogisticsEvent);