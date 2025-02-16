import { EventDto } from "./event.dto"
import { FlightDto } from "./flight.dto"
import { HotelDto } from "./hotel.dto"

export interface UserDto {
  id?: string,
  name?: string,
  email?: string,
  password?: string,
  lastName?: string,
  role?: string,
  position?: string,
  address?: string,
  flights?: FlightDto[],
  hotels?: HotelDto[],
  events?: EventDto[],
  createdAt?: Date
}