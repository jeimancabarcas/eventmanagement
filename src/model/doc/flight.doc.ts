import { UserDto } from "../dto/user.dto"

export interface FlightDoc {
  parentId: string
  eventId: string
  id?:string
  departure?: string 
  destination?: string 
  departureTime?: Date
  arrivalTime?: Date
  airline?: string
  flightNumber?: string
  cost?: number
  user?: UserDto;
}