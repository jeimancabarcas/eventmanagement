import { EventDto } from "./event.dto"

export interface UserDto {
  id?: string,
  name?: string,
  email: string,
  password?: string,
  lastName?: string,
  role?: string,
  position?: string,
  address?: string,
  flights?: any[],
  hotels?: any[],
  events?: EventDto[],
  createdAt?: Date
}