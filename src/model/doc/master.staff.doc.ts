import { firestore } from "firebase-admin"

export interface MasterStaffDoc {
  id: string
  identification: string
  name: string
  nationality: string
  date_of_birth: Date
  job_position: string
}

export function masterLogisticsDocToFirestore(logistics: MasterStaffDoc): firestore.DocumentData {
  return {
    id: logistics.id,
    identification: logistics.identification,
    name: logistics.name,
    nationality: logistics.nationality,
    date_of_birth: logistics.date_of_birth,
    job_position: logistics.job_position
  }
}

export function masterLogisticsDocFromFirestore(snapshot: firestore.QueryDocumentSnapshot): MasterStaffDoc {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    identification: data.identification,
    name: data.name,
    nationality: data.nationality,
    date_of_birth: data.date_of_birth,
    job_position: data.job_position
  }
}