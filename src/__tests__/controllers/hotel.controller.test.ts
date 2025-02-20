import request from "supertest";
import app from "../../app"; // Se importa la instancia de Express
import * as hotelService from "../../../src/services/hotel.service";
import { HotelDto } from "../../../src/model/dto/hotel.dto";

// ✅ Mockear completamente Firebase Admin
jest.mock("firebase-admin", () => ({
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
        })),
      })),
    })),
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: "testUser", role: "ADMIN" }),
    })),
  }));
  
  // ✅ Mockear `verifyToken` y `checkRole`
  jest.mock("../../middlewares/authorization", () => ({
    verifyToken: (req: any, res: any, next: any) => {
      req.user = { uid: "testUser", email: "test@example.com", role: "ADMIN" }; // 🔹 Asegurar que el usuario es ADMIN
      next();
    },
    checkRole: (allowedRoles: any) => (req: any, res: any, next: any) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }
      next();
    },
  }));
// ✅ Mockear los servicios de hoteles para evitar conexiones reales
jest.mock("../../../src/services/hotel.service");

describe("Hotel Controller", () => {
  let mockHotel: HotelDto;
  let mockHotels: HotelDto[];

  beforeEach(() => {
    // ✅ Datos de prueba basados en los DTOs
    mockHotel = {
      id: "hotel1",
      eventId: "event1",
      name: "Grand Hotel",
      country: "USA",
      city: "Los Angeles",
      address: "Sunset Blvd",
      bookingCode: "XYZ123",
      room: "101",
      checkIn: new Date().toISOString() as any,
      checkOut: new Date().toISOString() as any,
      cost: 500,
    };

    mockHotels = [mockHotel];

    // ✅ Configurar mocks para los servicios
    (hotelService.createHotel as jest.Mock).mockResolvedValue(mockHotel);
    (hotelService.getAllHotels as jest.Mock).mockResolvedValue(mockHotels);
    (hotelService.getByIdHotel as jest.Mock).mockResolvedValue(mockHotel);
    (hotelService.updateHotel as jest.Mock).mockResolvedValue(mockHotel);
    (hotelService.deleteHotel as jest.Mock).mockResolvedValue({ message: "Hotel deleted" });
    (hotelService.deleteManyHotels as jest.Mock).mockResolvedValue({ message: "Hotels deleted" });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Restaurar los mocks después de cada prueba
  });

  test("POST /hotel/create - debería crear un hotel", async () => {
    const response = await request(app)
      .post("/api/v1/hotel/create")
      .send(mockHotel)
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body); // ✅ Depuración si falla

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockHotel);
  });

  test("GET /hotel/getall - debería devolver todos los hoteles", async () => {
    const response = await request(app)
      .get("/api/v1/hotel/getall")
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(mockHotels.length);
    expect(response.body[0].name).toBe("Grand Hotel");
  });

  test("GET /hotel/getById/:userId/:hotelId - debería devolver un hotel por ID", async () => {
    const response = await request(app)
      .get(`/api/v1/hotel/getById/testUser/${mockHotel.id}`)
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body);

    expect(response.status).toBe(200);
    expect(response.body["Hotel finded"]).toEqual(mockHotel);
  });

  test("PUT /hotel/update - debería actualizar un hotel", async () => {
    const updatedHotel = { ...mockHotel, name: "Updated Hotel" };
    (hotelService.updateHotel as jest.Mock).mockResolvedValue(updatedHotel);

    const response = await request(app)
      .put("/api/v1/hotel/update")
      .send(updatedHotel)
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body);

    expect(response.status).toBe(200);
    expect(response.body["Event"].name).toBe("Updated Hotel");
  });

  test("DELETE /hotel/delete/:userId/:hotelId - debería eliminar un hotel", async () => {
    const response = await request(app)
      .delete(`/api/v1/hotel/delete/testUser/${mockHotel.id}`)
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Hotel deleted");
  });

  // ✅ Pruebas de error
  test("POST /hotel/create - debería devolver error 500 si hay un fallo", async () => {
    (hotelService.createHotel as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .post("/api/v1/hotel/create")
      .send(mockHotel)
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body);

    expect(response.status).toBe(500);
  });

  test("GET /hotel/getById/:userId/:hotelId - debería devolver error 500 si el hotel no existe", async () => {
    (hotelService.getByIdHotel as jest.Mock).mockRejectedValue(new Error("Hotel not found"));

    const response = await request(app)
      .get(`/api/v1/hotel/getById/testUser/${mockHotel.id}`)
      .set("Authorization", "Bearer valid-token");

     //console.log("Response Body:", response.body);

    expect(response.status).toBe(500);
  });
});
