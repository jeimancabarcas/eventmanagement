import { firestore } from "firebase-admin";

export interface EventDoc {
  id?: string
  name: string
  start_date?: Date
  end_date?: Date
  artist: string
  place: string
}
//function matListFlight(arg: any) {
//  const fligDoc = new Array<FlightDoc>();
//  for (const flight of arg.staff.flight) {
//    fligDoc.push(flight);
//  }
//  return fligDoc;
//}

export function eventDocToFirestore(eventDoc: EventDoc): firestore.DocumentData {
  return {
    name: eventDoc.name,
    start_date: eventDoc.start_date,
    end_date: eventDoc.end_date,
    artist: eventDoc.artist,
    place: eventDoc.place,
  }
}

export function eventDocFromFirestore(snapshot: firestore.QueryDocumentSnapshot): EventDoc {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    start_date: data.start_date,
    end_date: data.end_date,
    artist: data.artist,
    place: data.place,
  }
}