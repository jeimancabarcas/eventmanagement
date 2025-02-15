import express from "express";
import { UserRoutes } from "./routes/users.routes";
import { EventRoutes } from "./routes/event.routes";
import { EventLogisticsRoutes } from "./routes/staff.routes";
import { RoleRoutes } from "./routes/role.routes";
import { MasterStaffRoutes } from "./routes/master.staff.routes";
import { HotelRoutes } from "./routes/hotel.routes";
import { FlightsRoutes } from "./routes/flights.routes";
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

app.use(UserRoutes);
app.use(EventRoutes);
app.use(EventLogisticsRoutes);
app.use(MasterStaffRoutes);
app.use(RoleRoutes);
app.use(HotelRoutes);
app.use(FlightsRoutes);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});