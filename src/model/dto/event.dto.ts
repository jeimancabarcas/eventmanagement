import { firestore } from "firebase-admin"
import { UserDto } from "./user.dto"

export interface EventDto {
  id?: string
  name: string
  start_date: Date
  end_date: Date
  artist: string
  place: string
  staff?: UserDto[] | null
}
