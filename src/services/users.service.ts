import { UserDoc, userDtoFromFirestore, userDtoToFirestore } from "../model/doc/user.doc";
import { db } from "../config/firebase";
//import { auth } from "../config/firebase";
import { DtoToken } from "../model/doc/token";
import CryptoJs from "crypto-js";
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
import { UserDto } from "src/model/dto/user.dto";
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
  try {
    const userRecord = await admin.auth().createUser({
      email: user.email,
      password: user.password,
      displayName: user.name,
    });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: user.role });
    const userRef = db.collection("users").doc(userRecord.uid);
    const userData: UserDto= {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
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

export const updateUser = async (updateUser: UserDto): Promise<UserDto | undefined> => {
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

    const updatedSnapshot = await userRef.get();
    return updatedSnapshot.data() as UserDto;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return undefined;
  }
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

