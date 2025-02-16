import express from 'express';
import { CreateHotel, DeleteHotel, GetAllHotels, GetByIdHotel, UpdateHotel } from '../controllers/hotel.controller';


export const HotelRoutes = express.Router();

const prefix = '/api/v1/hotel';
HotelRoutes.post(`${prefix}/create`, CreateHotel);
HotelRoutes.get(`${prefix}/getall`, GetAllHotels);
HotelRoutes.put(`${prefix}/update`, UpdateHotel);
HotelRoutes.get(`${prefix}/getById/:userId/:hotelId`, GetByIdHotel);
HotelRoutes.delete(`${prefix}/delete/:userId/:hotelId`, DeleteHotel);