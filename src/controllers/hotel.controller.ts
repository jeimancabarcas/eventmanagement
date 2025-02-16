import { Request, Response } from "express";
import { HotelDto } from "../model/dto/hotel.dto";
import { createHotel, deleteHotel, deleteManyHotels, getAllHotels, getByIdHotel, updateHotel } from "../services/hotel.service";
import { HotelDoc } from "src/model/doc/hotel.doc";

export const CreateHotel = async (req: Request, res: Response) => {
  const hotelDto: HotelDto = {
    ...req.body
  };

  try {
    const hotelCreated = await createHotel(req.body);
    res.status(200).json(hotelCreated);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetAllHotels = async (req: Request, res: Response) => {
  try {
    const allHotels = await getAllHotels();
    res.status(200).json(allHotels);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const GetByIdHotel = async (req: Request, res: Response) => {
  const { userId, hotelId } = req.params;
  try {
    const hotelToFind = await getByIdHotel(userId, hotelId);
    res.status(200).json({ "Hotel finded": hotelToFind });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const UpdateHotel = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const hotelDto: HotelDto = req.body;
  try {
    const hotelUpdate = await updateHotel(hotelDto);
    res.status(200).json({
      "Message": "Updated event suscessfull",
      "Event": hotelUpdate
    }
    );
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

export const DeleteHotel = async (req: Request, res: Response) => {
  const { userId, hotelId } = req.params;
  try {
    const hotelDelete = await deleteHotel(userId, hotelId);
    res.status(200).send(hotelDelete);
  } catch (error) {
    res.status(500);
  }
}

export const DeleteManyHotel = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const response = await deleteManyHotels(ids);
    res.status(200).send(response);
  } catch (error) {
    res.status(500);
  }
}