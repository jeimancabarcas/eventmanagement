import express from 'express';
import { CreateFlight, DeleteFlight, GetAllFlights, GetByIdFlight, UpdateFlight } from '../controllers/flight.controller';
import { checkRole, verifyToken } from '../middlewares/authorization'


export const FlightsRoutes = express.Router();

const prefix = '/api/v1/flights';
FlightsRoutes.post(`${prefix}/create`, verifyToken, checkRole(["ADMIN"]), CreateFlight);
FlightsRoutes.get(`${prefix}/getall`, verifyToken, checkRole(["ADMIN"]), GetAllFlights);
FlightsRoutes.put(`${prefix}/update`, verifyToken, checkRole(["ADMIN"]), UpdateFlight);
FlightsRoutes.get(`${prefix}/getById/:userId/:flightId`, verifyToken, checkRole(["ADMIN"]), GetByIdFlight);
FlightsRoutes.delete(`${prefix}/delete/:userId/:flightId`, verifyToken, checkRole(["ADMIN"]), DeleteFlight);