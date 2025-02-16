import { UserDto } from "./user.dto";

export interface HotelDto {
    id?: string;
    eventId:string;
    name: string;
    country: string;
    city: string;
    address: string;
    bookingCode: string;
    room: string;
    checkIn: Date;
    checkOut: Date;
    cost: number;
    user?: UserDto;
  }