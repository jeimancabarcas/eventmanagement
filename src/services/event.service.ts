import { EventDoc, eventDocFromFirestore, eventDocToFirestore } from "../model/doc/event.doc";
import { db } from "../config/firebase";
import { EventDto, eventDtoFromFirestore, eventDtoToFirestore } from "../model/dto/event.dto";
import { StaffDto, staffDtoFromFirestore, staffDtoToFirestore } from "../model/dto/staff.dto";
import { StaffDoc } from "src/model/doc/staff.doc";


export const getAllEvents = async (): Promise<any> => {
  const eventsRefDocs = db
    .collection('events')
    .withConverter({
      toFirestore: eventDocToFirestore,
      fromFirestore: eventDocFromFirestore
    });

  const snapshotEvent = await eventsRefDocs.get();
  const listEventsDoc: EventDoc[] = snapshotEvent.docs.map(doc => doc.data());
  return listEventsDoc;
}

export const createEvent = async (eventDto: EventDto): Promise<EventDoc> => {
  const eventDoc: EventDoc = {
    artist: eventDto.artist,
    name: eventDto.name,
    start_date: eventDto.start_date,
    end_date: eventDto.end_date,
    place: eventDto.place,
  }
  const eventRef = await db.
    collection('events').add(eventDoc);

  if (eventDto.staff) {
    eventDto.staff.forEach(async (staff: StaffDto) => {
      await eventRef.collection('staff').add({
        staffRef: staff.staffRef,
        flights: staff.flights
      })
    })
  }
  const eventDocCreated: EventDoc = (await eventRef.get()).data() as EventDoc;
  return eventDocCreated;
}

export const getByIdEvent = async (id: string): Promise<EventDoc | undefined> => {
  const eventRef = await db
    .collection('events')
    .withConverter({
      toFirestore: eventDocToFirestore,
      fromFirestore: eventDocFromFirestore
    }).doc(id).get();

  return eventRef.data();
}

export const updateEvent = async (id: string, eventUpdate: EventDto): Promise<EventDto | undefined> => {
  const eventDoc: EventDoc = {
    name: eventUpdate?.name,
    artist: eventUpdate?.artist,
    start_date: eventUpdate?.start_date,
    end_date: eventUpdate?.end_date,
    place: eventUpdate?.place
  }
  const eventRef = await db.collection('events')
    .withConverter({
      toFirestore: eventDocToFirestore,
      fromFirestore: eventDocFromFirestore
    }).doc(id).update({ ...eventDoc });

  if (eventUpdate.staff) {
    const staffRefDoc = await db.collection('events').doc(id)
      .collection('staff')
      .withConverter({
        toFirestore: staffDtoToFirestore,
        fromFirestore: staffDtoFromFirestore
      }).get();

    eventUpdate.staff.forEach((staff: StaffDto) => {
      staff.flights?.forEach((flighs) => {
        const staffDto: StaffDoc = {
          staffRef: staff.staffRef,
          flights: [
            {
              departure: flighs.departure,
              departureTime: flighs.departureTime,
              destination: flighs.destination,
              airline: flighs.airline,
              arrivalTime: flighs.arrivalTime,
              flightNumber: flighs.flightNumber
            }
          ]
        }
        staffRefDoc.docs.filter(async (doc) => {
          if (doc.data().staffRef == staff.staffRef) {
            console.log({ id, ...doc.data() });
            const idStaff: string = doc.id;
            console.log(idStaff);
            await db.collection('events').doc(id).collection('staff').doc(idStaff).update({ ...staffDto })
          }
        });

      })
    })
  }
  const updatedEventRef = await db.collection('events')
    .withConverter({
      toFirestore: eventDtoToFirestore,
      fromFirestore: eventDtoFromFirestore
    }).doc(id).get();
  const updatedEventDoc: EventDto | undefined = updatedEventRef.data();
  return updatedEventDoc;
}

export const deleteEvent = async (id: string): Promise<string> => {
  const eventRef = await db.collection('events').doc(id).delete();
  return ' Event deleted';
}