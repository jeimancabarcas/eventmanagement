import { firestore } from "firebase-admin";

export interface FlightDto {
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

//function matFligh(arg: any){
//
//  return
//}
//
//export function FilghtDtoToFirestore(flightDto: FlightDto): firestore.DocumentData {
//  return {
//    idStaff: flightDto.idStaff,
//
//}
////
//export function FlightDtoFromFirestore(snapshot: firestore.QueryDocumentSnapshot): FlightDto {
//  const data = snapshot.data();
//  return {
//    idStaff: data.idStaff,
//    departure: data.departure,
//    destination: data.destination,
//    departureTime: data.departureTime,
//    airline: data.airline,
//    flightNumber: data.flightNumber
//  };
//}