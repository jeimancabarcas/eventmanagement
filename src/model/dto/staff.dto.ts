import { firestore } from "firebase-admin"
import { FlightDto } from "./flight.dto"

export interface StaffDto {
  staffRef?: string,
  flights?: FlightDto[]
}

export function staffDtoToFirestore(staffDto: StaffDto): firestore.DocumentData {
  return {
    staffRef: staffDto.staffRef,
    flight: staffDto.flights
  }
}

export function staffDtoFromFirestore(snapshot: firestore.QueryDocumentSnapshot): StaffDto {
  const data = snapshot.data();
  return {
    staffRef: data.staffRef,
    flights: data.fligh
  }
}