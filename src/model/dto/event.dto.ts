import { firestore } from "firebase-admin"
import { FlightDto } from "./flight.dto"
import { StaffDto } from "./staff.dto"

export interface EventDto {
  name: string
  start_date: Date
  end_date: Date
  artist: string
  place: string
  staff?: StaffDto[]
}

//function mapStaff(arg: any): [FlightDto] | undefined {
//  let listStaff = new Array<[StaffDto]>()
//  for (const staff of arg.staff) {
//    for (const flight of arg.staff.fligh) {
//      listStaff.push({
//        staffRef: staff.staffRef,
//        flight: staff?.fligh.map((flight: FlightDto) => flight) 
//      }
//    )
//    }
//
//  }
//  return listStaff;
//}

export function eventDtoToFirestore(event: EventDto): firestore.DocumentData {
  return {
    name: event.name,
    start_date: event.start_date,
    end_date: event.end_date,
    artist: event.artist,
    place: event.place,
    staff: event.staff
  }
}
//
export function eventDtoFromFirestore(snapshot: firestore.QueryDocumentSnapshot): EventDto {
  const data = snapshot.data();
  return {
    name: data.name,
    start_date: data.start_date,
    end_date: data.end_date,
    artist: data.artist,
    place: data.place,
    staff: data.staff,
  };
}