import express from "express";
import { UserRoutes } from "./routes/users.routes";
import { EventRoutes } from "./routes/event.routes";
import { HotelRoutes } from "./routes/hotel.routes";
import { FlightsRoutes } from "./routes/flights.routes";
import { DashboardRoutes } from "./routes/dashboard.routes";
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors());

app.use(UserRoutes);
app.use(EventRoutes);
app.use(HotelRoutes);
app.use(FlightsRoutes);
app.use(DashboardRoutes);


export default app;