import { firestore } from "firebase-admin"

export interface MasterLogisticsStaffDto {
  identification: string
  name: string
  nationality: string
  date_of_birth: Date
  job_position: string
}

export function masterLogisticsDtoToFirestore(logistics: MasterLogisticsStaffDto): firestore.DocumentData {
  return {
    identification: logistics.identification,
    name: logistics.name,
    nationality: logistics.nationality,
    date_of_birth: logistics.date_of_birth,
    job_position: logistics.job_position
  }
}

export function masterLogisticsDtoFromFirestore(snapshot: firestore.QueryDocumentSnapshot): MasterLogisticsStaffDto {
  const data = snapshot.data();
  return {
    identification: data.identification,
    name: data.name,
    nationality: data.nationality,
    date_of_birth: data.date_of_birth,
    job_position: data.job_position
  }
}