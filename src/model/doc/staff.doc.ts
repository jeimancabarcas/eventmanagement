import { firestore } from "firebase-admin"
import { FlightDto } from "../dto/flight.dto"

export interface StaffDoc {
  id?: string
  staffRef?: string,
  flights?: FlightDto[]

}

//export function eventLogisticsDocToFirestore(logistics: StaffDoc): firestore.DocumentData {
//  return {
//    id: logistics.id,
//    identification: logistics.identification,
//    name: logistics.name,
//    nationality: logistics.nationality,
//    date_of_birth: logistics.date_of_birth,
//    job_position: logistics.job_position
//  }
//}
//
//export function eventLogisticsDocFromFirestore(snapshot: firestore.QueryDocumentSnapshot): StaffDoc {
//  const data = snapshot.data();
//  return {
//    id: snapshot.id,
//    identification: data.identification,
//    name: data.name,
//    nationality: data.nationality,
//    date_of_birth: data.date_of_birth,
//    job_position: data.job_position
//  }
//}