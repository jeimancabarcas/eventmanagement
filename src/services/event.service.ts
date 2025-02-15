import { EventDoc, eventDocFromFirestore, eventDocToFirestore } from "../model/doc/event.doc";
import { db } from "../config/firebase";
import { EventDto, eventDtoFromFirestore, eventDtoToFirestore } from "../model/dto/event.dto";
import { StaffDto, staffDtoFromFirestore, staffDtoToFirestore } from "../model/dto/staff.dto";
import { StaffDoc } from "src/model/doc/staff.doc";
import { UserDto } from "src/model/dto/user.dto";


export const getAllEvents = async (): Promise<EventDto[]> => {
  const eventsSnapshot = await db.collection("events").get();
  const events: EventDto[] = [];

  for (const eventDoc of eventsSnapshot.docs) {
    const eventData = eventDoc.data() as EventDto;
    eventData.id = eventDoc.id;
    eventData.staff = [];

    // 🔹 Obtener el staff del evento
    const staffSnapshot = await db.collection("events").doc(eventDoc.id).collection("staff").get();

    for (const staffDoc of staffSnapshot.docs) {
      const userId = staffDoc.id; // ID del usuario en la subcolección "staff"
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        console.warn(`⚠️ Usuario con ID ${userId} no encontrado en "users".`);
        continue;
      }

      // 🔥 Fusionar datos de "users" y "staff"
      eventData.staff.push({
        id: userId,
        ...userDoc.data(),  // Datos de la colección "users"
      } as UserDto);
    }

    events.push(eventData);
  }

  return events;
};

export const createEvent = async (eventDto: EventDto): Promise<EventDto> => {
  const eventDoc = {
    artist: eventDto.artist,
    name: eventDto.name,
    start_date: eventDto.start_date,
    end_date: eventDto.end_date,
    place: eventDto.place,
  };

  // 🔹 Agregar el evento y obtener su referencia
  const eventRef = await db.collection("events").add(eventDoc);

  // 🔹 Validar si hay staff y agregarlo a la subcolección "staff"
  if (eventDto.staff && eventDto.staff.length > 0) {
    for (const staff of eventDto.staff) {
      if (!staff.id) continue; // 🔥 Evita errores si el staff no tiene ID

      const staffRef = eventRef.collection("staff").doc(String(staff.id)); // Puedes agregar más información si lo necesitas
      staffRef.create({id: staff.id})
    }
  }

  // 🔹 Obtener el evento creado
  const eventDocCreated = (await eventRef.get()).data() as EventDto;
  eventDocCreated.staff = [];

  // 🔹 Obtener los documentos de staff
  const staffsCreated = await eventRef.collection("staff").get();

  // 🔹 Obtener la información de cada usuario desde "users"
  for (const staffDoc of staffsCreated.docs) {
    const userId = staffDoc.id; // El ID de staff es el mismo que en "users"
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.warn(`⚠️ Usuario con ID ${userId} no encontrado en "users".`);
      continue;
    }

    // 🔥 Fusionamos los datos de "staff" con los datos del usuario desde "users"
    eventDocCreated.staff.push({
      id: userId,
      ...userDoc.data(),  // Datos de la colección "users"
    } as UserDto);
  }

  return eventDocCreated;
};

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

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const eventRef = await db.collection('events').doc(id).delete();
    return true;
  } catch (error) {
    throw (error)
  }
}

export const deleteManyEvents = async (ids: string[]): Promise<boolean> => {
  const batch = db.batch();

  try {
    ids.forEach(id => {
      const eventRef = db.collection('events').doc(id);
      batch.delete(eventRef);
    });

    await batch.commit(); // Ejecuta la eliminación en batch
    return true;
  } catch (error) {
    console.error("Error al eliminar eventos:", error);
    throw error;
  }
}