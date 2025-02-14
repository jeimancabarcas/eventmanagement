import { UserDoc, userDtoFromFirestore, userDtoToFirestore } from "../model/doc/user.doc";
import { db } from "../config/firebase";
//import { auth } from "../config/firebase";
import { DtoToken } from "../model/doc/token";
import CryptoJs from "crypto-js";
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
import { UserDto } from "src/model/dto/user.dto";

export const getAllUsers = async (): Promise<UserDoc[]> => {
  const usersRef = db
    .collection('users')
    .withConverter({
      toFirestore: userDtoToFirestore,
      fromFirestore: userDtoFromFirestore
    });
  const querySnapshot = await usersRef.get();
  const users = new Array<UserDoc>();
  querySnapshot.forEach((doc) => {
    users.push(doc.data())
  });
  return users;
}

export const createUser = async (user: UserDoc): Promise<UserDto | undefined> => {
  if (process.env.SECRET_KEY) {
    user = {
      ...user,
      password: CryptoJs.AES.encrypt(user.password, process.env.SECRET_KEY).toString()
    }
    const userRef = db.
      collection('users')
      .withConverter({
        toFirestore: userDtoToFirestore,
        fromFirestore: userDtoFromFirestore
      });
    const userId = await userRef.add(user);
    const snapshop = await userRef.doc(userId.id).get();
    const newUser = snapshop.data();
    return newUser;
  }
}

export const getById = async (id: string): Promise<UserDto | undefined> => {
  const userRef = db
    .collection('users')
    .withConverter({
      toFirestore: userDtoToFirestore,
      fromFirestore: userDtoFromFirestore
    });
  const snapshot = await userRef.doc(id).get();
  const user = snapshot.data();
  return user;
}

export const updateUser = async (id: string, updateUser: UserDto): Promise<UserDto | undefined> => {
  const userRef = db
    .collection('users')
    .withConverter({
      toFirestore: userDtoToFirestore,
      fromFirestore: userDtoFromFirestore
    });
  await userRef.doc(id).update({
    ...updateUser
  });
  const snapshop = await userRef.doc(id).get();
  return snapshop.data();
}
export const deleteUser = async (id: string): Promise<string> => {
  const userRef = db
    .collection('users')
    .withConverter({
      toFirestore: userDtoToFirestore,
      fromFirestore: userDtoFromFirestore
    });
  await userRef.doc(id).delete();
  return 'deleted user';
}


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

