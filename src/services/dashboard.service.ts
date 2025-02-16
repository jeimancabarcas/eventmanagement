import { db } from "../config/firebase";
import { EventDto} from "../model/dto/event.dto";
import { StatsDto } from "src/controllers/dashboard.controller";
const admin = require("firebase-admin");


export const getStats = async (): Promise<StatsDto> => {
  const eventsRef = db.collection("events");
  const userStaffRef = db.collection("users").where("role", "==", "STAFF")
  const hotelsRef = db.collectionGroup("hotels")

  const statsDto: StatsDto = {} as StatsDto;
  statsDto.staffHired = (await userStaffRef.get()).docs.length;
  statsDto.eventsRegistered = (await eventsRef.get()).docs.length;
  statsDto.totalActiveEvents = (await eventsRef.where("end_date", ">=", admin.firestore.Timestamp.fromDate(new Date())).get()).docs.length;
  statsDto.totalClosedEvents = (await eventsRef.where("end_date", "<", admin.firestore.Timestamp.fromDate(new Date())).get()).docs.length;

  return statsDto;
};
