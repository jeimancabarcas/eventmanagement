export interface HotelDoc {
  parentId?: string,
  eventId: string,
  name: string;
  country: string;
  city: string;
  address: string;
  bookingCode: string;
  room: string;
  checkIn: Date;
  checkOut: Date;
  cost: number;
}