import { firestore } from "firebase-admin";
export interface UserDoc {
  id: string
  name: string,
  email: string,
  password: string,
  lastName: string,
  rol: string
}

export function userDtoToFirestore(userDto: UserDoc): firestore.DocumentData {
  return {
    name: userDto.name,
    email: userDto.email,
    password: userDto.password,
    lastName: userDto.lastName,
    rol: userDto.rol
  }
}

export function userDtoFromFirestore(snapshot: firestore.QueryDocumentSnapshot): UserDoc {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    email: data.email,
    password: data.password,
    lastName: data.lastName,
    rol: data.rol
  }
}