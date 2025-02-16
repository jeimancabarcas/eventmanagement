import { UserDto } from "src/model/dto/user.dto";
import { db } from "../config/firebase";
import { EventDto} from "../model/dto/event.dto";
import { StatsDto } from "src/controllers/dashboard.controller";
const admin = require("firebase-admin");


export const getStats = async (): Promise<StatsDto> => {
  const eventsRef = db.collection("events");
  const userStaffRef = db.collection("users").where("role", "==", "STAFF")
  const hotelsRef = db.collectionGroup("hotels")

  const statsDto: StatsDto = {} as StatsDto;
  statsDto.staffHired = (await userStaffRef.get()).docs.length;
  statsDto.eventsRegistered = (await eventsRef.get()).docs.length;
  statsDto.totalActiveEvents = (await eventsRef.where("end_date", ">=", admin.firestore.Timestamp.fromDate(new Date())).get()).docs.length;
  statsDto.totalClosedEvents = (await eventsRef.where("end_date", "<", admin.firestore.Timestamp.fromDate(new Date())).get()).docs.length;
  const hotelExpenses = await getHotelExpenses();
  statsDto.totalHotelExpensesForActiveEvents = hotelExpenses.expensesActiveEvents;
  statsDto.totalHotelExpensesForClosedEvents = hotelExpenses.expensesClosedEvents;
  const flightExpenses = await getFlightExpenses();
  statsDto.totalFlightExpensesForActiveEvents = flightExpenses.expensesActiveEvents;
  statsDto.totalFlightExpensesForClosedEvents = flightExpenses.expensesClosedEvents;
  statsDto.staffHiredWithActiveEvents = (await getUsersWithActiveEvents()).length;

  return statsDto;
};

const getHotelExpenses = async(): Promise<{expensesActiveEvents: number, expensesClosedEvents: number}> => {
  const activeEventsSnapshot = await db.collection("events").where("end_date", ">=", admin.firestore.Timestamp.fromDate(new Date())).get();
  const inactiveEventsSnapshot = await db.collection("events").where("end_date", "<", admin.firestore.Timestamp.fromDate(new Date())).get();

  const inactiveEventIds = inactiveEventsSnapshot.docs.map(doc => doc.id);
  const activeEventIds = activeEventsSnapshot.docs.map(doc => doc.id);
  let totalHotelExpensesForActiveEvents = 0;
  let totalHotelExpensesForClosedEvents = 0;

  const usersSnapshot = await db.collection("users").get();
        
  for (const userDoc of usersSnapshot.docs) {
      const hotelsSnapshot = await db.collection("users")
          .doc(userDoc.id)
          .collection("hotels")
          .get();

      hotelsSnapshot.forEach(hotelDoc => {
          const hotelData = hotelDoc.data();
          const hotelCost = hotelData.cost || 0;
          
          if (activeEventIds.includes(hotelData.eventId)) {
            totalHotelExpensesForActiveEvents += hotelCost;
          } else if (inactiveEventIds.includes(hotelData.eventId)) {
            totalHotelExpensesForClosedEvents += hotelCost;
          }
      });
  }

  return {
    expensesActiveEvents: totalHotelExpensesForActiveEvents,
    expensesClosedEvents: totalHotelExpensesForClosedEvents
  }
}

const getFlightExpenses = async(): Promise<{expensesActiveEvents: number, expensesClosedEvents: number}> => {
  const activeEventsSnapshot = await db.collection("events").where("end_date", ">=", admin.firestore.Timestamp.fromDate(new Date())).get();
  const inactiveEventsSnapshot = await db.collection("events").where("end_date", "<", admin.firestore.Timestamp.fromDate(new Date())).get();

  const inactiveEventIds = inactiveEventsSnapshot.docs.map(doc => doc.id);
  const activeEventIds = activeEventsSnapshot.docs.map(doc => doc.id);
  let totalFlightExpensesForActiveEvents = 0;
  let totalFlightExpensesForClosedEvents = 0;

  const usersSnapshot = await db.collection("users").get();
        
  for (const userDoc of usersSnapshot.docs) {
      const flightsSnapshot = await db.collection("users")
          .doc(userDoc.id)
          .collection("flights")
          .get();

      flightsSnapshot.forEach(flightDoc => {
          const flightData = flightDoc.data();
          const flightCost = flightData.cost || 0;
          
          if (activeEventIds.includes(flightData.eventId)) {
            totalFlightExpensesForActiveEvents += flightCost;
          } else if (inactiveEventIds.includes(flightData.eventId)) {
            totalFlightExpensesForClosedEvents += flightCost;
          }
      });
  }

  return {
    expensesActiveEvents: totalFlightExpensesForActiveEvents,
    expensesClosedEvents: totalFlightExpensesForClosedEvents
  }
}

export const getUsersWithoutActiveEvents = async (): Promise<UserDto[]> => {
  try {
    let usersWithoutActiveEvents: any[] = [];

    // 1️⃣ Obtener eventos activos (endDate >= ahora)
    const activeEventsSnapshot = await db.collection("events")
        .where("end_date", ">=", admin.firestore.Timestamp.fromDate(new Date()))
        .get();

        // 2️⃣ Obtener los eventId de los eventos activos
        const activeEventIds = activeEventsSnapshot.docs.map(doc => doc.id);
        console.log("Eventos activos:", activeEventIds);

        // 3️⃣ Obtener todos los usuarios
        const usersSnapshot = await db.collection("users").get();

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;

            // 4️⃣ Obtener la subcolección "events" de cada usuario
            const userEventsSnapshot = await db.collection("users")
                .doc(userId)
                .collection("events")
                .get();

            if (userEventsSnapshot.empty) {
                // 5️⃣ Si el usuario NO tiene eventos, lo agregamos directamente
                usersWithoutActiveEvents.push({ id: userId, ...userDoc.data() });
                continue;
            }

            // 6️⃣ Verificar si el usuario NO tiene eventos activos
            const hasActiveEvent = userEventsSnapshot.docs.some(doc => activeEventIds.includes(doc.id));

            if (!hasActiveEvent) {
                usersWithoutActiveEvents.push({ id: userId, ...userDoc.data() });
            }
        }

        console.log("Usuarios SIN eventos activos:", usersWithoutActiveEvents);
        return usersWithoutActiveEvents;
    } catch (error) {
        console.error("Error obteniendo usuarios sin eventos activos:", error);
        return [];
    }
};

export const getUsersWithActiveEvents = async (): Promise<UserDto[]> => {
  try {
    let usersWithActiveEvents: any[] = [];

    // 1️⃣ Obtener eventos activos (endDate >= ahora)
    const activeEventsSnapshot = await db.collection("events")
        .where("end_date", ">=", admin.firestore.Timestamp.fromDate(new Date()))
        .get();

    if (activeEventsSnapshot.empty) {
        console.log("No hay eventos activos.");
        return [];
    }

    // 2️⃣ Obtener los eventId de los eventos activos
    const activeEventIds = activeEventsSnapshot.docs.map(doc => doc.id);

    console.log("Eventos activos:", activeEventIds);

    // 3️⃣ Obtener todos los usuarios
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        
        // 4️⃣ Obtener la subcolección "events" de cada usuario
        const userEventsSnapshot = await db.collection("users")
            .doc(userId)
            .collection("events")
            .get();

        if (userEventsSnapshot.empty) continue; // Si no tiene eventos, lo ignoramos

        // 5️⃣ Filtrar si al menos uno de sus eventos está en la lista de eventos activos
        const hasActiveEvent = userEventsSnapshot.docs.some(doc => activeEventIds.includes(doc.id));

        if (hasActiveEvent) {
            usersWithActiveEvents.push({ id: userId, ...userDoc.data() });
        }
    }

    console.log("Usuarios con eventos activos:", usersWithActiveEvents);
    return usersWithActiveEvents;
  } catch (error) {
      console.error("Error obteniendo usuarios con eventos activos:", error);
      return [];
  }
};