import { Role } from "src/model/doc/rol";
import { db } from "../config/firebase";

async function crearRoles():Promise<void> {
    try {
      const rolesRef = db.collection('roles');
      const batch = db.batch();
      
      const roles: Role[] = [
        { id: 'admin', label: 'ADMIN' },
        { id: 'staff', label: 'STAFF' }
      ];
      
      roles.forEach(role => {
        const roleRef = rolesRef.doc(); 
        batch.set(roleRef, role);
      });
  
      // Commit del batch
      await batch.commit();
      console.log('Colección "roles" creada y roles agregados con éxito.');
    } catch (error) {
      console.error('Error al crear la colección y roles:', error);
    }
  }
  
  crearRoles();