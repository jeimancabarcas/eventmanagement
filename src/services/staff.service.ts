import { StaffDto } from "../model/dto/staff.dto";
import { db } from "../config/firebase";
import { StaffDoc } from "../model/doc/staff.doc";
import { eventDtoFromFirestore, eventDtoToFirestore } from "../model/dto/event.dto";
import { eventDocFromFirestore, eventDocToFirestore } from "../model/doc/event.doc";
import { UserDoc } from "src/model/doc/user.doc";

export const getAllLogisticsEvent = async (): Promise<StaffDoc[]> => {
  const eventRef = db.collection('events')
    .withConverter({
      toFirestore: eventDocToFirestore,
      fromFirestore: eventDocFromFirestore
    });
  const snapshotEvent = await eventRef.get();
  let listEventLogistics = new Array<StaffDoc>();

  //for (const snapshot of snapshotEvent.docs) {
  //  let eventLogisticsRef = snapshot.ref.collection('logistics')
  //  const snapshotEventLogistics = await eventLogisticsRef.get();
  //  for (const logis of snapshotEventLogistics.docs) {
  //    listEventLogistics.push(logis.data());
  //  }
  //}
  return listEventLogistics;
}

export const createLogisticsEvent = async (id: string, logistics: StaffDto): Promise<StaffDto | undefined> => {
  //const logisticRef = await db.
  //collection('events').doc(id)
  //.withConverter({
  //  toFirestore: eventDtoToFirestore,
  //  fromFirestore: eventDtoFromFirestore
  //})
  //.collection('logistics')
  //.withConverter({
  //  toFirestore: eventLogisticsDtoToFirestore,
  //  fromFirestore: eventLogisticsDtoFromFirestore
  //})
  //.add(logistics);
  //const logisticDoc = await logisticRef.get();
  //const newLogistics: StaffDto | undefined = logisticDoc.data();
  return;
}

export const getByIdLogisticsEvent = async (idEvent: string, idLogistic: string): Promise<StaffDoc | undefined> => {
  const eventRef = await db
    .collection('events')
    .withConverter({
      toFirestore: eventDocToFirestore,
      fromFirestore: eventDocFromFirestore
    }).doc(idEvent).get();

  //const eventLogisticRef = await eventRef.ref
  //  .collection('logistics')
  //  .withConverter({
  //    toFirestore: eventLogisticsDocToFirestore,
  //    fromFirestore: eventLogisticsDocFromFirestore
  //  }).doc(idLogistic).get();
  //
  //let eventLogisticFinded = {} as StaffDoc | undefined;
  //if (eventLogisticRef) {
  //  eventLogisticFinded = eventLogisticRef.data();
  //}
  return;
}

export const updateLogisticsEvent = async (id: string, updateLogistics: StaffDto): Promise<StaffDto | undefined> => {
  //const eventRef = await db
  //  .collection('events').doc(id).get();

  //const logisticsRef = await eventRef.ref.collection('logistics')
  //  .withConverter({
  //    toFirestore: eventLogisticsDocToFirestore,
  //    fromFirestore: eventLogisticsDocFromFirestore
  //  })
  //  .get();

  //let logisticDocFinded = {} as StaffDoc;

  //logisticsRef.docs.forEach((doc) => {
  //  if (doc.data().identification == updateLogistics.identification) {
  //    logisticDocFinded = doc.data();
  //  }
  //})

  //if (logisticDocFinded != undefined) {
  //  await eventRef.ref.collection('logistics').doc(logisticDocFinded.id).update({
  //    ...updateLogistics
  //  });
  //}
  //let logistictDtoUpdated = {} as StaffDto | undefined;
  //const snapshotUpdated = await eventRef.ref.collection('logistics')
  //  .withConverter({
  //    toFirestore: eventLogisticsDtoToFirestore,
  //    fromFirestore: eventLogisticsDtoFromFirestore
  //  }).doc(logisticDocFinded.id).get();
  //logistictDtoUpdated = snapshotUpdated.data();

  return;
}

export const deleteLogisticsEvent = async (id: string, idLogistic: string): Promise<string> => {
  const eventRef = await db
    .collection('events').doc(id).get();
  await eventRef.ref.collection('logistics').doc(idLogistic).delete();
  return 'deleted logistics';
}