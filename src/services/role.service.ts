import { db } from "../config/firebase";
import { RoleDoc, roleFromFirestore, roleToFirestore } from "../model/doc/rol.doc";
import { RoleDto } from "../model/dto/rol.dto";

export const getAllRoles = async (): Promise<RoleDto[]> => {
  const roleRef = db
    .collection('roles')
    .withConverter({
      toFirestore: roleToFirestore,
      fromFirestore: roleFromFirestore
    });
  const querySnapshot = await roleRef.get();
  const roles = new Array<RoleDto>();
  querySnapshot.forEach((doc) => {
    roles.push(doc.data());
  })
  return roles;
}

export const createRole = async (role: RoleDoc): Promise<RoleDto | undefined> => {
  const roleRef = db
    .collection('roles')
    .withConverter({
      toFirestore: roleToFirestore,
      fromFirestore: roleFromFirestore
    });
  const roleId = await roleRef.add(role);
  const snapshop = await roleRef.doc(roleId.id).get();
  const newRol = snapshop.data();
  return newRol;
}

export const getByIdRole = async (id: string): Promise<RoleDto | undefined> => {
  const roleRef = db
    .collection('roles')
    .withConverter({
      toFirestore: roleToFirestore,
      fromFirestore: roleFromFirestore
    });
  const snapshot = await roleRef.doc(id).get();
  const roleFinded = snapshot.data();
  return roleFinded;
}

export const updateRole = async (id: string, updateRole: RoleDoc): Promise<RoleDto | undefined> => {
  const roleRef = db
    .collection('roles')
    .withConverter({
      toFirestore: roleToFirestore,
      fromFirestore: roleFromFirestore
    });
  await roleRef.doc(id).update({
    ...updateRole
  });
  const snapshop = await roleRef.doc(id).get();
  return snapshop.data();
}

export const deleteRole = async (id: string): Promise<string> => {
  const roleRef = db
    .collection('roles')
    .withConverter({
      toFirestore: roleToFirestore,
      fromFirestore: roleFromFirestore
    });
  await roleRef.doc(id).delete();
  return 'deleted role';
}