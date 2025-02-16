import { firestore } from "firebase-admin"
import { FlightDto } from "./flight.dto"
import { HotelDto } from "./hotel.dto";

export interface StaffDto {
  staffRef?: string,
  hotel?: HotelDto;
  flights?: FlightDto[]
}

export function staffDtoToFirestore(staffDto: StaffDto): firestore.DocumentData {
  return {
    staffRef: staffDto.staffRef,
    hotel: staffDto.hotel,
    flight: staffDto.flights
  }
}

export function staffDtoFromFirestore(snapshot: firestore.QueryDocumentSnapshot): StaffDto {
  const data = snapshot.data();
  return {
    staffRef: data.staffRef,
    hotel: data.hotel,
    flights: data.fligh
  }
}