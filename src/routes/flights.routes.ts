import express from 'express';
import { CreateFlight, DeleteFlight, GetAllFlights, GetByIdFlight, UpdateFlight } from '../controllers/flight.controller';


export const FlightsRoutes = express.Router();

const prefix = '/api/v1/flights';
FlightsRoutes.post(`${prefix}/create`, CreateFlight);
FlightsRoutes.get(`${prefix}/getall`, GetAllFlights);
FlightsRoutes.put(`${prefix}/update`, UpdateFlight);
FlightsRoutes.get(`${prefix}/getById/:userId/:flightId`, GetByIdFlight);
FlightsRoutes.delete(`${prefix}/delete/:userId/:flightId`, DeleteFlight);