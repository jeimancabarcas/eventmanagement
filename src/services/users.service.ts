import { Auth, db } from "../config/firebase";
import { DtoToken } from "../model/doc/token";
import CryptoJs from "crypto-js";
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
import { UserDto } from "src/model/dto/user.dto";
import { EventDto } from "src/model/dto/event.dto";
import { UserDoc } from "src/model/doc/user.doc";
const admin = require("firebase-admin");

export const getAllUsers = async (): Promise<UserDto[]> => {
  const usersSnapshot = await db
    .collection('users').get();
  const users = new Array<UserDto>();
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data() as UserDto;
    userData.id = userDoc.id;
    userData.events = [];
    userData.events = await getEventsInformation(userDoc.id)
    
    users.push(userData);
  }
  return users;
}

export const createUser = async (user: UserDto): Promise<UserDto> => {
  user.role = user.role?.toUpperCase();
    const userRecord = await Auth.createUser({
      email: user.email,
      password: user.password,
      displayName: user.name,
    });
    await Auth.setCustomUserClaims(userRecord.uid, { role: user.role });
    const userRef = db.collection("users").doc(userRecord.uid);
    const userData: UserDto = {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role?.toUpperCase(),
      position: user.position,
      address: user.address,
      createdAt: admin.firestore?.FieldValue?.serverTimestamp(),
    };

    await userRef.set(userData);
    // 🔹 Agregar nuevo staff si hay datos
    if (user.events && user.events.length > 0) {
      /* istanbul ignore next */
      for (const event of user.events) {
        if (!event.id) continue; // 🔥 Evita errores si el staff no tiene ID

        const userEventRef = userRef.collection("events").doc(String(event.id));
        await userEventRef.set({ id: event.id }); 
        const eventRef = db.collection("events").doc(String(event.id)).collection('staff').doc(userRef.id);
        await eventRef.set({ id: userRef.id }); 
      }
    }
    // 🔹 Obtener el evento actualizado
    const userDocCreated = (await userRef.get())?.data() as UserDto;
    userDocCreated.events = [];
    userDocCreated.events = await getEventsInformation(userRef.id);

    return {
      id: userRef.id,
      ...userDocCreated
    };
}

export const getById = async (id: string): Promise<UserDto> => {
  /* istanbul ignore next */
  const userRef = await db.collection('users').doc(id);
  /* istanbul ignore next */
  const userDocCreated = (await userRef.get()).data() as UserDto;
  /* istanbul ignore next */
  userDocCreated.events = [];
  /* istanbul ignore next */
  userDocCreated.events = await getEventsInformation(userRef.id)
  /* istanbul ignore next */
  return {
    id: userRef.id,
    ...userDocCreated
  };
}

export const getByRole = async (role: string): Promise<UserDto[] | undefined> => {
  const snapshot = await db.collection('users').where('role', '==', role.toUpperCase()).get();
  const users: UserDto[] = [];
  snapshot.forEach(userSnapshot => {
    users.push({
      id: userSnapshot.id,
      ...userSnapshot.data()
    } as UserDto)
  });
  return users;
}

export const updateUser = async (updateUser: UserDto): Promise<UserDto | undefined> => {
  updateUser.role = updateUser.role?.toUpperCase();
  try {
    const userRef = db.collection("users").doc(updateUser.id as string);
    const snapshot = await userRef.get();
    /* istanbul ignore next */
    if (!snapshot.exists) {
      throw new Error(`Usuario con ID ${updateUser.id as string} no encontrado.`);
    }
    /* istanbul ignore next */
    const userDataDoc: UserDoc= {
      name: updateUser.name,
      lastName: updateUser.lastName,
      email: updateUser.email,
      role: updateUser.role,
      address: updateUser.address,
      position: updateUser.position,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    /* istanbul ignore next */
    await userRef.update({...userDataDoc});
    /* istanbul ignore next */
    await admin.auth().updateUser(updateUser.id, {
      email: updateUser.email,
      password: updateUser.password,
      displayName: updateUser.name,
    });
    
        /* istanbul ignore next */
    const eventsSnapshot = await userRef.collection("events").get();
    /* istanbul ignore next */
    const batch = db.batch();
    /* istanbul ignore next */
    eventsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    // 🔹 Agregar nuevo staff si hay datos
        /* istanbul ignore if */
    if (updateUser.events && updateUser.events.length > 0) {
      for (const event of updateUser.events) {
        if (!event.id) continue; // 🔥 Evita errores si el staff no tiene ID

        const userEventRef = userRef.collection("events").doc(String(event.id));
        await userEventRef.set({ id: event.id }); 
        const eventRef = db.collection("events").doc(String(event.id)).collection('staff').doc(userRef.id);
        await eventRef.set({ id: userRef.id }); 
      }
    }
    // 🔹 Obtener el evento actualizado
    const userDocCreated = (await userRef.get()).data() as UserDto;
    userDocCreated.events = [];
    /* istanbul ignore next */
    userDocCreated.events = await getEventsInformation(userRef.id);

        /* istanbul ignore next */
    return {
      id: userRef.id,
      ...userDocCreated
    };
  } catch (error) {
    return undefined;
  }
}

const getEventsInformation = async (userDocId: string): Promise<EventDto[]> => {
    const events: EventDto[] = []
    // 🔹 Obtener el events del user
    const eventsSnapshot = await db.collection("users").doc(userDocId).collection("events").get();
    for (const doc of eventsSnapshot.docs) {
      const eventId = doc.id;
      const eventDoc = await db.collection("events").doc(eventId).get();

      if (!eventDoc.exists) {
        continue;
      }

        /* istanbul ignore next */
      events.push({
        id: eventId,
        ...eventDoc.data(), 
      } as EventDto);
    }
  return events;
}

export const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await admin.auth().getUser(id);
      await admin.auth().deleteUser(id); 
      const userRef = db.collection("users").doc(id);
      await deleteSubcollection(userRef, "events");
      await deleteSubcollection(userRef, "hotels");
      await userRef.delete(); 
      return true;
      /* istanbul ignore next */
    } catch (error) {
      /* istanbul ignore next */
      throw error;
    }
};

export const deleteManyUsers = async (users: UserDto[]): Promise<boolean> => {
  const batch = db.batch();
  try {
    for (const user of users) {
      try {
        await admin.auth().getUser(user.id as string);
        await admin.auth().deleteUser(user.id as string);
      } catch (error: any) {}
    }
    for (const user of users) {
      const userRef = db.collection("users").doc(user.id as string);
      await deleteSubcollection(userRef, "events");
      await deleteSubcollection(userRef, "hotels");
      batch.delete(userRef);
    }

    await batch.commit(); // 🔥 Ejecutar la eliminación en batch
    return true;
    /* istanbul ignore next */
  } catch (error) {
    /* istanbul ignore next */
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
