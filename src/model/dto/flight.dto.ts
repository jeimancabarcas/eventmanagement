import { firestore } from "firebase-admin";

export interface FlightDto {
  id?:string
  departure: string 
  destination: string 
  departureTime: Date
  arrivalTime: Date
  airline: string
  flightNumber: string
}

