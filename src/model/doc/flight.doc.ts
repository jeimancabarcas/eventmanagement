export interface FlightDoc {
  id?: string,
  departure: string, // Código IATA del aeropuerto de salida
  destination: string, // Código IATA del aeropuerto de llegada
  departureTime: Date,
  arrivalTime: Date,
  airline: string,
  flightNumber: string
  //seatNumber?: string;
  //classType: 'Economy' | 'Business' | 'First Class';
  //purpose: 'Business' | 'Training' | 'Relocation' | 'Other';
  //status: 'Scheduled' | 'Completed' | 'Cancelled';
  //notes?: string;
}