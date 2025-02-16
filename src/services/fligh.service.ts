import { db } from "../config/firebase";
import { FlightDoc } from "src/model/doc/flight.doc";
import { FlightDto } from "src/model/dto/flight.dto";

export const getAllFights = async (): Promise<FlightDoc[]> => {
  const flightRefDocs = await db.collection('flights').get();
  const listflightDoc: FlightDoc[] = flightRefDocs.docs.map((fligh) => {
    return fligh.data() as FlightDoc;
  });
  return listflightDoc;
}

export const createFlight = async (flighDto: FlightDto): Promise<FlightDoc> => {
  const flighDoc: FlightDoc = {
    departure: flighDto.departure,
    destination: flighDto.destination,
    departureTime: flighDto.departureTime,
    arrivalTime: flighDto.arrivalTime,
    airline: flighDto.airline,
    flightNumber: flighDto.flightNumber
  }
  const flighRef = await db.collection('flights').add(flighDoc);

  return (await db.collection('flights').doc(flighRef.id as string).get()).data() as FlightDoc;
}

export const getByIdFlight = async (id: string): Promise<FlightDoc | string> => {
  const flightRef = await db.collection('flights').doc(id).get();
  if (flightRef.exists) {
    return flightRef.data() as FlightDoc;
  }else{
    return `Flight with ${id} not exist`;
  }
}

export const updateFlight = async (flightUpdate: FlightDto): Promise<FlightDto> => {
  const flightDoc: FlightDoc = {
    airline: flightUpdate.airline,
    arrivalTime: flightUpdate.arrivalTime,
    departure: flightUpdate.departure,
    departureTime: flightUpdate.departureTime,
    destination: flightUpdate.destination,
    flightNumber: flightUpdate.flightNumber
  }
  await db.collection('flights').doc(flightUpdate.id as string).update({ ...flightDoc });
  const flightUdated = await db.collection('flights').doc(flightUpdate.id as string).get();
  return flightUdated.data() as FlightDto;
}

export const deleteFlight = async (id: string): Promise<boolean | undefined | string> => {
  try {
    const snapshotFlight = await db.collection('flights').doc(id).get();
    if (snapshotFlight.exists) {
      await db.collection('flights').doc(id).delete();
      return true;
    } else {
      return `Flight with ${id} not exist`;
    }
  } catch (error) {
    console.log("Error to delete hotel")
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
    console.error("Error to delete hotels:", error);
    throw error;
  }
}