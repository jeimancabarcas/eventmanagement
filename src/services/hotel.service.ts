import { HotelDto } from "../model/dto/hotel.dto";
import { db } from "../config/firebase";
import { HotelDoc } from "src/model/doc/hotel.doc";
import { UserDoc } from "src/model/doc/user.doc";
import { UserDto } from "src/model/dto/user.dto";
const admin = require("firebase-admin");


export const getAllHotels = async (): Promise<HotelDto[]> => {
  const hotelRefDocs = await db.collectionGroup("hotels").get();
  const userRef = db.collection("users");

  const listHotel: HotelDto[] = [];
  for(const hotel of hotelRefDocs.docs) {
    const parentId = hotel.data().parentId as string;
    if(!parentId) continue;
    const userDocument = await userRef.doc(parentId).get();
    const userData = userDocument.exists ? (userDocument.data() as UserDoc) : null;
    listHotel.push({
      id: hotel.id,
      ...hotel.data(),
      user:{ 
        id: parentId,
        ...userData
      },
    } as HotelDto)
  }

  return listHotel;
};

export const createHotel = async (hotelDto: HotelDto): Promise<HotelDoc> => {
  const hotelDoc: HotelDoc = {
      parentId: hotelDto.user?.id,
      name: hotelDto.name,
      country: hotelDto.country,
      city: hotelDto.city,
      address: hotelDto.address,
      bookingCode: hotelDto.bookingCode,
      room: hotelDto.room,
      checkIn: admin.firestore.Timestamp.fromDate(new Date(hotelDto.checkIn)),
      checkOut: admin.firestore.Timestamp.fromDate(new Date(hotelDto.checkOut)),
      cost: hotelDto.cost
  }
  const hotelRef = await db.collection('users').doc(hotelDto.user?.id as string).collection('hotels').add( hotelDoc );
  const userRef = db.collection('users');

  await hotelRef.update({ id: hotelRef.id });
  const hotelDocumentCreated = (await hotelRef.get()).data() as HotelDoc;
  const userDocument = (await userRef.doc(hotelDocumentCreated.parentId as string).get()).data() as UserDoc

  const response: HotelDto = {
    id: hotelRef.id,
    ...hotelDocumentCreated,
    user: { ...userDocument }
  }
  return response
}

export const getByIdHotel = async (userId: string, hotelId: string): Promise<HotelDto> => {
  const hotelRef = db.collection('users').doc(userId).collection('hotels').doc(hotelId);
  const userRef = db.collection('users');
  if(!(await hotelRef.get()).exists) {
    throw new Error("The hotel doesn't exist");
  }
  const hotelDocument = (await hotelRef.get()).data() as HotelDoc;
  const userDocument = (await userRef.doc(hotelDocument.parentId as string).get()).data() as UserDoc

  const response: HotelDto = {
    id: hotelRef.id,
    ...hotelDocument,
    user: { ...userDocument }
  }
  return response
}

export const updateHotel = async (hotelUpdate: HotelDto): Promise<HotelDto> => {
  const hotelRef = db.collection('users').doc(hotelUpdate.user?.id as string).collection('hotels').doc(hotelUpdate.id as string);
  const userRef = db.collection('users');
  const hotelDoc: HotelDoc = {
    name: hotelUpdate.name,
    address: hotelUpdate.address,
    country: hotelUpdate.country,
    city: hotelUpdate.city,
    room: hotelUpdate.room,
    bookingCode: hotelUpdate.bookingCode,
    checkIn: admin.firestore.Timestamp.fromDate(new Date(hotelUpdate.checkIn)),
    checkOut: admin.firestore.Timestamp.fromDate(new Date(hotelUpdate.checkOut)),
    cost: hotelUpdate.cost
  }
  await hotelRef.update({...hotelDoc});
  const hotelDocumentUpdated = (await hotelRef.get()).data() as HotelDoc;
  console.log(hotelDocumentUpdated)
  const userDocument = (await userRef.doc(hotelDocumentUpdated.parentId as string).get()).data() as UserDoc

  const response: HotelDto = {
    id: hotelRef.id,
    ...hotelDocumentUpdated,
    user: { ...userDocument }
  }
  return response;
}

export const deleteHotel = async (userId: string, hotelId: string): Promise<boolean | undefined> => {
  try {
    
    const hotelRef = db.collection('users').doc(userId).collection('hotels').doc(hotelId);
    const snapshotHotel = await hotelRef.get();
    if (snapshotHotel.exists) {
      await hotelRef.delete();
      return true;
    }else{
      return false;
    }
  } catch (error) {
    console.log("Error to delete hotel")
  }
  
}

export const deleteManyHotels = async (ids: string[]): Promise<boolean> => {
  const batch = db.batch();
  try {
    ids.forEach(id => {
      const hotelRef = db.collection('hotels').doc(id);
      batch.delete(hotelRef);
    });

    await batch.commit(); // Ejecuta la eliminación en batch
    return true;
  } catch (error) {
    console.error("Error to delete hotels:", error);
    throw error;
  }
}