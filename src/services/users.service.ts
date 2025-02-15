import { db } from "../config/firebase";
import { DtoToken } from "../model/doc/token";
import CryptoJs from "crypto-js";
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
import { UserDto } from "src/model/dto/user.dto";
import { EventDto } from "src/model/dto/event.dto";
const admin = require("firebase-admin");

export const getAllUsers = async (): Promise<UserDto[]> => {
  const usersSnapshot = await db
    .collection('users').get();
  const users = new Array<UserDto>();
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data() as UserDto;
    userData.id = userDoc.id;
    userData.events = [];
    userData.events = await getUsersInformation(userDoc.id)
    
    users.push(userData);
  }
  return users;
}

export const createUser = async (user: UserDto): Promise<UserDto> => {
  user.role = user.role?.toUpperCase();
  try {
    const userRecord = await admin.auth().createUser({
      email: user.email,
      password: user.password,
      displayName: user.name,
    });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: user.role });
    const userRef = db.collection("users").doc(userRecord.uid);
    const userData: UserDto = {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role?.toUpperCase(),
      position: user.position,
      address: user.address,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(userData);
    // 🔹 Agregar nuevo staff si hay datos
    if (user.events && user.events.length > 0) {
      for (const event of user.events) {
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
    userDocCreated.events = await getUsersInformation(userRef.id);

    return {
      id: userRef.id,
      ...userDocCreated
    };
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    throw Error(error.message)
  }
}

export const getById = async (id: string): Promise<UserDto> => {
  const userRef = await db.collection('users').doc(id);
  const userDocCreated = (await userRef.get()).data() as UserDto;
  userDocCreated.events = [];
  userDocCreated.events = await getUsersInformation(userRef.id)
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
    if (!snapshot.exists) {
      throw new Error(`Usuario con ID ${updateUser.id as string} no encontrado.`);
    }
    const userData: UserDto= {
      name: updateUser.name,
      lastName: updateUser.lastName,
      email: updateUser.email,
      role: updateUser.role,
      address: updateUser.address,
      position: updateUser.position
    };
    await userRef.update({
      ...userData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await admin.auth().updateUser(updateUser.id, {
      email: updateUser.email,
      password: updateUser.password,
      displayName: updateUser.name,
    });
    
    // 🔹 Eliminar todos los documentos en "events" si existen
    const eventsSnapshot = await userRef.collection("events").get();
    const batch = db.batch();
    eventsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    // 🔹 Agregar nuevo staff si hay datos
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
    userDocCreated.events = await getUsersInformation(userRef.id);

    return {
      id: userRef.id,
      ...userDocCreated
    };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return undefined;
  }
}

const getUsersInformation = async (userDocId: string): Promise<EventDto[]> => {
  const events: EventDto[] = []
    // 🔹 Obtener el events del user
    const eventsSnapshot = await db.collection("users").doc(userDocId).collection("events").get();

    for (const doc of eventsSnapshot.docs) {
      const eventId = doc.id;
      const eventDoc = await db.collection("events").doc(eventId).get();

      if (!eventDoc.exists) {
        console.warn(`Event con ID ${eventId} no encontrado en "users".`);
        continue;
      }

      events.push({
        id: eventId,
        ...eventDoc.data(), 
      } as EventDto);
    }
  return events;
}
export const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const userRef = db.collection("users").doc(id);
      await deleteSubcollection(userRef, "events");
      await userRef.delete();
      return true;
    } catch (error) {
      throw error;
    }
};

export const deleteManyUsers = async (users: UserDto[]): Promise<boolean> => {
  const batch = db.batch();
  try {
    for (const user of users) {
      const eventRef = db.collection("users").doc(user.id as string);
      await deleteSubcollection(eventRef, "events");
      batch.delete(eventRef);
    }
    await batch.commit(); // 🔥 Ejecutar la eliminación en batch
    return true;
  } catch (error) {
    throw error;
  }
};

export const authUser = async (dtoToken: DtoToken) => {
  const userTofind = await db.collection('users').where("name", "==", dtoToken.name).limit(1).get();
  if (userTofind.empty) {
    return 'not exist the user';
  }
  const user = userTofind.docs[0];
  if (!process.env.SECRET_KEY) return;
  const passBytes = CryptoJs.AES.decrypt(user.data().password, process.env.SECRET_KEY);
  const decryptedPassword = passBytes.toString(CryptoJs.enc.Utf8);
  if (decryptedPassword == dtoToken.password) {
    let id = user.id;
    const token = jwt.sign({ id, dtoToken }, process.env.SECRET_KEY, {
      expiresIn: '1h'
    })
    //const customToken = await auth.createCustomToken(user.id, dtoToken);
    return token;
  }
}

const deleteSubcollection = async (parentRef: FirebaseFirestore.DocumentReference, subcollection: string) => {
  const subcollectionRef = parentRef.collection(subcollection);
  const snapshot = await subcollectionRef.get();

  if (snapshot.empty) return; // No hay documentos, no es necesario eliminar

  const batch = db.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
};
