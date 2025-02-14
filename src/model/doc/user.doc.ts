import { firestore } from "firebase-admin";
export interface UserDoc {
  id?: string
  name: string,
  email: string,
  password: string,
  lastName: string,
  role: string
}

export function userDtoToFirestore(userDto: UserDoc): firestore.DocumentData {
  return {
    name: userDto.name,
    email: userDto.email,
    password: userDto.password,
    lastName: userDto.lastName,
    role: userDto.role
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
    role: data.role
  }
}