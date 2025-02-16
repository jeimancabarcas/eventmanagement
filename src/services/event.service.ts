import { EventDoc, eventDocFromFirestore, eventDocToFirestore } from "../model/doc/event.doc";
import { db } from "../config/firebase";
import { EventDto, eventDtoFromFirestore, eventDtoToFirestore } from "../model/dto/event.dto";
import { StaffDto, staffDtoFromFirestore, staffDtoToFirestore } from "../model/dto/staff.dto";
import { StaffDoc } from "src/model/doc/staff.doc";
import { UserDto } from "src/model/dto/user.dto";
const admin = require("firebase-admin");


export const getAllEvents = async (): Promise<EventDto[]> => {
  const eventsSnapshot = await db.collection("events").get();
  const events: EventDto[] = [];

  for (const eventDoc of eventsSnapshot.docs) {
    const eventData = eventDoc.data() as EventDto;
    eventData.id = eventDoc.id;
    eventData.staff = [];
    eventData.staff = await getStaffsInformation(eventDoc.id)
    
    events.push(eventData);
  }

  return events;
};

export const getComingEvents = async (): Promise<EventDto[]> => {
  const eventsSnapshot = await db.collection("events")
    .where("start_date", ">=", admin.firestore.Timestamp.fromDate(new Date()))
    .get();
  const events: EventDto[] = [];

  for (const eventDoc of eventsSnapshot.docs) {
    const eventData = eventDoc.data() as EventDto;
    eventData.id = eventDoc.id;
    eventData.staff = [];
    eventData.staff = await getStaffsInformation(eventDoc.id)
    
    events.push(eventData);
  }

  return events;
};

export const createEvent = async (eventDto: EventDto): Promise<EventDto> => {
  const eventDoc = {
    artist: eventDto.artist,
    name: eventDto.name,
    start_date: admin.firestore.Timestamp.fromDate(new Date(eventDto.start_date)),
    end_date: admin.firestore.Timestamp.fromDate(new Date(eventDto.end_date)),
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
  eventDocCreated.staff = await getStaffsInformation(eventRef.id)

  return {
    id: eventRef.id,
    ...eventDocCreated
  };
};


export const getByIdEvent = async (id: string): Promise<EventDoc | undefined> => {
  const eventRef = await db.collection('events').doc(id);
  const eventDocCreated = (await eventRef.get()).data() as EventDto;
  eventDocCreated.staff = [];
  eventDocCreated.staff = await getStaffsInformation(eventRef.id)
  return {
    id: eventRef.id,
    ...eventDocCreated
  };
}

const getStaffsInformation = async (eventDocId: string): Promise<UserDto[]> => {
  const staffs:UserDto[] = []
    // 🔹 Obtener el staff del evento
    const staffSnapshot = await db.collection("events").doc(eventDocId).collection("staff").get();

    for (const staffDoc of staffSnapshot.docs) {
      const userId = staffDoc.id; // ID del usuario en la subcolección "staff"
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        console.warn(`⚠️ Usuario con ID ${userId} no encontrado en "users".`);
        continue;
      }

      // 🔥 Fusionar datos de "users" y "staff"
      staffs.push({
        id: userId,
        ...userDoc.data(),  // Datos de la colección "users"
      } as UserDto);
    }
  return staffs;
}

export const updateEvent = async (eventUpdate: EventDto): Promise<EventDto | undefined> => {
  if (!eventUpdate.id) return undefined; // Validar que el evento tenga un ID

  const eventRef = db.collection("events").doc(eventUpdate.id);
  console.log(eventUpdate)
  await eventRef.update({
    name: eventUpdate.name,
    start_date: admin.firestore.Timestamp.fromDate(new Date(eventUpdate.start_date)),
    end_date: admin.firestore.Timestamp.fromDate(new Date(eventUpdate.end_date)),
    artist: eventUpdate.artist,
    place: eventUpdate.place
  });

  // 🔹 Eliminar todos los documentos en "staff" si existen
  const staffSnapshot = await eventRef.collection("staff").get();
  const batch = db.batch();

  staffSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit(); // 🔥 Ejecuta la eliminación en batch

  // 🔹 Agregar nuevo staff si hay datos
  if (eventUpdate.staff && eventUpdate.staff.length > 0) {
    for (const staff of eventUpdate.staff) {
      if (!staff.id) continue; // 🔥 Evita errores si el staff no tiene ID

      const staffRef = eventRef.collection("staff").doc(String(staff.id));
      await staffRef.set({ id: staff.id }); // 🔥 Usar `.set()` en lugar de `.create()`
    }
  }

  // 🔹 Obtener el evento actualizado
  const eventDocCreated = (await eventRef.get()).data() as EventDto;
  eventDocCreated.staff = await getStaffsInformation(eventUpdate.id);

  return {
    id: eventDocCreated.id,
    ...eventDocCreated
  };
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const eventRef = db.collection("events").doc(id);
    await deleteSubcollection(eventRef, "staff");
    await eventRef.delete();
    return true;
  } catch (error) {
    throw error;
  }
};

export const deleteManyEvents = async (ids: string[]): Promise<boolean> => {
  const batch = db.batch();

  try {
    for (const id of ids) {
      const eventRef = db.collection("events").doc(id);
      await deleteSubcollection(eventRef, "staff");
      batch.delete(eventRef);
    }
    await batch.commit(); // 🔥 Ejecutar la eliminación en batch
    return true;
  } catch (error) {
    throw error;
  }
};

const deleteSubcollection = async (parentRef: FirebaseFirestore.DocumentReference, subcollection: string) => {
  const subcollectionRef = parentRef.collection(subcollection);
  const snapshot = await subcollectionRef.get();

  if (snapshot.empty) return; // No hay documentos, no es necesario eliminar

  const batch = db.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
};