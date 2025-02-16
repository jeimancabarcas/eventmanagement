import express from 'express';
import { CreateFlight, DeleteFlight, GetAllFlights, GetByIdFlight, UpdateFlight } from '../controllers/fligh.controller';


export const FlightsRoutes = express.Router();

const prefix = '/api/v1/flights';
FlightsRoutes.post(`${prefix}/create`, CreateFlight);
FlightsRoutes.get(`${prefix}/getall`, GetAllFlights);
FlightsRoutes.put(`${prefix}/update`, UpdateFlight);
FlightsRoutes.get(`${prefix}/getById/:id`, GetByIdFlight);
FlightsRoutes.delete(`${prefix}/delete/:id`, DeleteFlight);