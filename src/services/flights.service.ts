import { db } from "../config/firebase";
import { FlightDoc } from "src/model/doc/flight.doc";
import { UserDoc } from "src/model/doc/user.doc";
import { FlightDto } from "src/model/dto/flight.dto";
const admin = require("firebase-admin");


export const getAllFights = async (): Promise<FlightDoc[]> => {
  const flightsRefDocs = await db.collectionGroup("flights").get();
  const userRef = db.collection("users");

  const listFlights: FlightDto[] = [];
  for(const flight of flightsRefDocs.docs) {
    const parentId = flight.data().parentId as string;
    if(!parentId) continue;
    const userDocument = await userRef.doc(parentId).get();
    const userData = userDocument?.exists ? (userDocument.data() as UserDoc) : null;
    listFlights.push({
      id: flight.id,
      ...flight.data(),
      user:{ 
        id: parentId,
        ...userData
      },
    } as FlightDto)
  }

  return listFlights;
}
export const createFlight = async (flighDto: FlightDto): Promise<FlightDoc> => {
  const flightDoc: FlightDoc = {
    parentId: flighDto.user?.id as string,
    eventId: flighDto.eventId,
    departure: flighDto.departure,
    destination: flighDto.destination,
    departureTime: admin.firestore.Timestamp.fromDate(new Date(flighDto.departureTime)),
    arrivalTime: admin.firestore.Timestamp.fromDate(new Date(flighDto.arrivalTime)),
    airline: flighDto.airline,
    flightNumber: flighDto.flightNumber,
    cost: flighDto.cost
  }
  const flighRef = await db.collection('users').doc(flighDto.user?.id as string).collection('flights').add( flightDoc );
  const userRef = db.collection('users');

  await flighRef.update({ id: flighRef.id });
  const flightDocumentCreated = (await flighRef.get())?.data() as FlightDoc;
  const userDocument = (await userRef.doc(flightDocumentCreated?.parentId as string).get())?.data() as FlightDoc


  const response: FlightDto = {
    id: flighRef.id,
    ...flightDocumentCreated as FlightDto,
    user: { 
      id: flightDocumentCreated?.parentId,
      ...userDocument 
    }
  }
  return response
}
export const getByIdFlight = async (userId: string, flightId: string): Promise<FlightDoc | string> => {
  const flightRef = db.collection('users').doc(userId).collection('flights').doc(flightId);
    const userRef = db.collection('users');
    if(!(await flightRef.get()).exists) {
      throw new Error("The hotel doesn't exist");
    }
    const flightDocument = (await flightRef.get()).data() as FlightDoc;
    const userDocument = (await userRef.doc(flightDocument.parentId as string).get()).data() as UserDoc
  
    const response: FlightDto = {
      id: flightRef.id,
      ...flightDocument as FlightDto,
      user: { 
        id: flightDocument.parentId,
        ...userDocument 
      }
    }
    return response
}
export const updateFlight = async (flightUpdate: FlightDto): Promise<FlightDto> => {
  const flightRef = db.collection('users').doc(flightUpdate.user?.id as string).collection('flights').doc(flightUpdate.id as string);
  const userRef = db.collection('users');
  const flightDoc: FlightDoc = {
    eventId: flightUpdate.eventId,
    parentId: flightUpdate.user?.id as string,
    departure: flightUpdate.departure,
    destination: flightUpdate.destination,
    departureTime: admin?.firestore?.Timestamp?.fromDate(new Date(flightUpdate.departureTime)),
    arrivalTime: admin?.firestore?.Timestamp?.fromDate(new Date(flightUpdate.arrivalTime)),
    airline: flightUpdate.airline,
    flightNumber: flightUpdate.flightNumber,
    cost: flightUpdate.cost
  }
  await flightRef.update({...flightDoc});
  const flightDocumentUpdated = (await flightRef.get())?.data() as FlightDoc;
  const userDocument = (await userRef.doc(flightDocumentUpdated?.parentId as string).get())?.data() as UserDoc

  const response: FlightDto = {
    id: flightRef.id,
    ...flightDocumentUpdated as FlightDto,
    user: { ...userDocument }
  }
  return response;
}
export const deleteFlight = async (userId: string, flightId: string): Promise<boolean | undefined | string> => {
    const flightRef = db.collection('users').doc(userId).collection('flights').doc(flightId);
    const snapshotFlight = await flightRef.get();
    if (snapshotFlight.exists) {
      await flightRef.delete();
      return true;
    }else{
      return false;
    }
}

export const deleteManyFlights = async (ids: string[]): Promise<boolean> => {
  const batch = db.batch();
  try {
    ids.forEach(id => {
      const flightRef = db.collection('flights').doc(id);
      batch.delete(flightRef);
    });

    await batch.commit(); // Ejecuta la eliminación en batch
    return true;
  } catch (error) {
    throw error;
  }
}