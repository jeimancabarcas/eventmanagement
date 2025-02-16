import { UserDto } from "./user.dto"

export interface FlightDto {
  id?:string
  parentId: string,
  eventId: string,
  departure: string 
  destination: string 
  departureTime: Date
  arrivalTime: Date
  airline: string
  flightNumber: string
  cost: number
  user?: UserDto;
}

