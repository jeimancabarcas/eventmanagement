import express from 'express';
import { CreateHotel, DeleteHotel, GetAllHotels, GetByIdHotel, UpdateHotel } from '../controllers/hotel.controller';
import { verifyToken } from '../middlewares/authorization'


export const HotelRoutes = express.Router();

const prefix = '/api/v1/hotel';
HotelRoutes.post(`${prefix}/create`, verifyToken, CreateHotel);
HotelRoutes.get(`${prefix}/getall`, verifyToken, GetAllHotels);
HotelRoutes.put(`${prefix}/update`, verifyToken, UpdateHotel);
HotelRoutes.get(`${prefix}/getById/:userId/:hotelId`, verifyToken, GetByIdHotel);
HotelRoutes.delete(`${prefix}/delete/:userId/:hotelId`, verifyToken, DeleteHotel);