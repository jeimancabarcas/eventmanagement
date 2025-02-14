import { masterLogisticsDtoFromFirestore, masterLogisticsDtoToFirestore, MasterLogisticsStaffDto } from "../model/dto/master.staff.dto";
import { db } from "../config/firebase";
import { masterLogisticsDocFromFirestore, masterLogisticsDocToFirestore, MasterStaffDoc, } from "../model/doc/master.staff.doc";


export const getAllMasterStaff = async (): Promise<MasterStaffDoc[]> => {
  const masterRef = db.
    collection('masterstaff')
    .withConverter({
      toFirestore: masterLogisticsDocToFirestore,
      fromFirestore: masterLogisticsDocFromFirestore
    });
  const masterSnapshot = await masterRef.get();
  const listMasterLogistics = new Array<MasterStaffDoc>();

  for (const master of masterSnapshot.docs) {
    let masterLogics: MasterStaffDoc = master.data()
    listMasterLogistics.push(masterLogics);
  }
  return listMasterLogistics;
}

export const createMasterStaff = async (masterLogistic: MasterLogisticsStaffDto): Promise<MasterLogisticsStaffDto | undefined> => {
  const masterRef = await db.collection('masterstaff').add(masterLogistic);

  const masterSnapshot = await db.collection('masterstaff')
    .withConverter({
      toFirestore: masterLogisticsDtoToFirestore,
      fromFirestore: masterLogisticsDtoFromFirestore
    }).doc(masterRef.id).get();
  const masterCreated: MasterLogisticsStaffDto | undefined = masterSnapshot.data()
  return masterCreated;
}

export const getByIdMasterStaff = async (id: string): Promise<MasterLogisticsStaffDto | undefined> => {
  const masterRef = await db
    .collection('masterstaff')
    .withConverter({
      toFirestore: masterLogisticsDocToFirestore,
      fromFirestore: masterLogisticsDocFromFirestore
    }).doc(id).get();

  const masterFinded: MasterLogisticsStaffDto | undefined = masterRef.data();
  return masterFinded;
}

export const updateMasterStaff = async (id: string, updateMaster: MasterLogisticsStaffDto): Promise<MasterLogisticsStaffDto | undefined> => {
  await db.collection('masterstaff').doc(id).update({
    ...updateMaster
  });
  const masterRef = await db.collection('masterstaff')
    .withConverter({
      toFirestore: masterLogisticsDtoToFirestore,
      fromFirestore: masterLogisticsDtoFromFirestore
    }).doc(id).get();
  const updateMasterLogistic: MasterLogisticsStaffDto | undefined = masterRef.data()
  return updateMasterLogistic;
}

export const deleteMasterStaff = async (id: string): Promise<string> => {
  const logisticRef = db.collection('masterstaff').doc(id).delete();
  return 'masterlogistics deleted';
}

