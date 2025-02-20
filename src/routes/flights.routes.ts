import express from 'express';
import { CreateFlight, DeleteFlight, GetAllFlights, GetByIdFlight, UpdateFlight } from '../controllers/flight.controller';
import { verifyToken } from '../middlewares/authorization'


export const FlightsRoutes = express.Router();

const prefix = '/api/v1/flights';
FlightsRoutes.post(`${prefix}/create`, verifyToken, CreateFlight);
FlightsRoutes.get(`${prefix}/getall`, verifyToken, GetAllFlights);
FlightsRoutes.put(`${prefix}/update`, verifyToken, UpdateFlight);
FlightsRoutes.get(`${prefix}/getById/:userId/:flightId`, verifyToken, GetByIdFlight);
FlightsRoutes.delete(`${prefix}/delete/:userId/:flightId`, verifyToken, DeleteFlight);