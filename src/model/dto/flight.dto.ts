export interface FlightDto {
  id?:string
  departure: string 
  destination: string 
  departureTime: Date
  arrivalTime: Date
  airline: string
  flightNumber: string
  cost: number
}

