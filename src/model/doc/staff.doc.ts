import { firestore } from "firebase-admin"
import { FlightDto } from "../dto/flight.dto"
import { HotelDto } from "../dto/hotel.dto"

export interface StaffDoc {
  id?: string
  staffRef?: string,
  hotel?: HotelDto,
  flights?: FlightDto[]
}