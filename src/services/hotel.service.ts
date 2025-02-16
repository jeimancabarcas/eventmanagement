import { HotelDto } from "../model/dto/hotel.dto";
import { db } from "../config/firebase";
import { HotelDoc } from "src/model/doc/hotel.doc";

export const getAllHotels = async (): Promise<HotelDoc[]> => {
  const hotelRefDocs = await db.collection('hotels').get();

  const listHotelDoc = hotelRefDocs.docs.map((hotel)=>{
    return hotel.data() as HotelDoc;
  })
  return listHotelDoc;
}

export const createHotel = async (hotelDto: HotelDto): Promise<HotelDoc> => {
  const hotelDoc: HotelDoc = {
    ...hotelDto
  }
  const hotelRef = await db.collection('hotels').add( hotelDoc );

  const hotelCreated: HotelDoc=  (await db.collection('hotels').doc(hotelRef.id).get()).data() as HotelDoc;
  return hotelCreated;
}

export const getByIdHotel = async (id: string): Promise<HotelDoc> => {
  const eventRef = await db.collection('hotels').doc(id).get();
  return {
    id: eventRef.id,
    ...eventRef.data()
  } as HotelDoc;
}

export const updateHotel = async (hotelUpdate: HotelDto): Promise<HotelDto> => {
  const hotelDoc: HotelDoc = {
   name: hotelUpdate.name,
   address: hotelUpdate.address,
   country: hotelUpdate.country,
   city: hotelUpdate.city
  }
  await db.collection('hotels').doc(hotelUpdate.id as string).update({ ...hotelDoc });
  
  return {
    ... (await db.collection('hotels').doc(hotelUpdate.id as string).get()).data()  
  } as HotelDto;
}

export const deleteHotel = async (id: string): Promise<boolean | undefined> => {
  try {
    const snapshotHotel = await db.collection('hotels').doc(id).get();
    if (snapshotHotel.exists) {
      await db.collection('hotels').doc(id).delete();
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