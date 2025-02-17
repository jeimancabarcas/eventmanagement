import { firestore } from "firebase-admin";

export interface EventDoc {
  id?: string
  name: string
  start_date?: Date
  end_date?: Date
  artist: string
  place: string
}