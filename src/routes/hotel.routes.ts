import express from 'express';
import { CreateHotel, DeleteHotel, GetAllHotels, GetByIdHotel, UpdateHotel } from '../controllers/hotel.controller';
import { checkRole, verifyToken } from '../middlewares/authorization'


export const HotelRoutes = express.Router();

const prefix = '/api/v1/hotel';
HotelRoutes.post(`${prefix}/create`, verifyToken, checkRole(["ADMIN"]), CreateHotel);
HotelRoutes.get(`${prefix}/getall`, verifyToken, checkRole(["ADMIN"]), GetAllHotels);
HotelRoutes.put(`${prefix}/update`, verifyToken, checkRole(["ADMIN"]), UpdateHotel);
HotelRoutes.get(`${prefix}/getById/:userId/:hotelId`, checkRole(["ADMIN"]), verifyToken, GetByIdHotel);
HotelRoutes.delete(`${prefix}/delete/:userId/:hotelId`, checkRole(["ADMIN"]), verifyToken, DeleteHotel);