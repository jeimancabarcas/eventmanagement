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
  usersSnapshot.forEach((user) => {
    const userDto: UserDto = {
      id: user.id,
      email: user.data().email,
      name: user.data().name,
      lastName: user.data().lastName,
      role: user.data().role,
      address: user.data().address,
      position: user.data().position,
      createdAt: user.data().createdAt.toDate(),
    }
    users.push(userDto)
  });
  return users;
}

export const createUser = async (user: UserDto): Promise<UserDto | undefined> => {
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
    const snapshot = await userRef.get();

    return {
      id: snapshot.id,
      name: snapshot.data()?.name,
      lastName: snapshot.data()?.lastName,
      email: snapshot.data()?.email,
      role: snapshot.data()?.role,
      position: snapshot.data()?.position,
      address: snapshot.data()?.address,
      createdAt: snapshot.data()?.createdAt,
    };
  } catch (error) {
    console.error("Error creando usuario:", error);
    return undefined;
  }
}

export const getById = async (id: string): Promise<UserDto | undefined> => {
  const userRef = db
    .collection('users');
  const snapshot = await userRef.doc(id).get();
  const user = snapshot.data() as UserDto;
  return {
    id: snapshot.id,
    ...snapshot.data()
  } as UserDto;
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

        const eventRef = userRef.collection("events").doc(String(event.id));
        await eventRef.set({ id: event.id }); // 🔥 Usar `.set()` en lugar de `.create()`
      }
    }
    // 🔹 Obtener el evento actualizado
    const userDocCreated = (await userRef.get()).data() as UserDto;

    return {
      id: userRef.id,
      ...userDocCreated
    };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
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
    const userRef = admin.firestore().collection("users").doc(id);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      return false;
    }

    try {
      await admin.auth().getUser(id);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        return false;
      }
      throw error; 
    }


    await userRef.delete(); 
    await admin.auth().deleteUser(id); 

    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return false;
  }
};

export const deleteManyUsers = async (users: UserDto[]): Promise<boolean> => {
  const batch = admin.firestore().batch();

  try {
    // 🔹 Eliminar usuarios en batch de Firestore
    users.forEach((user: UserDto) => {
      const userRef = admin.firestore().collection("users").doc(user.id as string);
      batch.delete(userRef);

      // Si también tienes eventos asociados, puedes eliminarlos aquí
      const eventRef = admin.firestore().collection("events").doc(user.id as string);
      batch.delete(eventRef);
    });

    await batch.commit();

    for (const user of users) {
      try {
        await admin.auth().getUser(user.id as string);
        
        await admin.auth().deleteUser(user.id as string);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          console.warn(`Usuario con ID ${user.id} no encontrado en Firebase Authentication.`);
        } else {
          throw error; 
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error al eliminar usuarios:", error);
    throw Error("Error al eliminar usuarios. Inténtalo nuevamente.");
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

