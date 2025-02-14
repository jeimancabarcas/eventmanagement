import { firestore } from "firebase-admin";

export interface RoleDoc {
  id: string;
  name: string;
  description: string;
}

export function roleToFirestore(role: RoleDoc): firestore.DocumentData {
  return {
    name: role.name,
    description: role.description
  }
}

export function roleFromFirestore(snapshot: firestore.QueryDocumentSnapshot): RoleDoc {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    description: data.description,
  }
}