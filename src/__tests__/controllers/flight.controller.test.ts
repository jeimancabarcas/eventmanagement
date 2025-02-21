import request from "supertest";
import app from "../../app"; // Se importa la instancia de Express
import * as flightsService from "../../../src/services/flights.service";
import { FlightDto } from "../../../src/model/dto/flight.dto";

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
    req.user = { uid: "testUser", email: "test@example.com", role: "ADMIN" }; // ✅ Simulación de usuario autenticado con rol admin
    next();
  },
  checkRole: (allowedRoles: any) => (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  },
}));

// ✅ Mockear los servicios de vuelos para evitar conexiones reales
jest.mock("../../../src/services/flights.service");

describe("Flight Controller", () => {
  let mockFlight: FlightDto;
  let mockFlights: FlightDto[];

  beforeEach(() => {
    // ✅ Datos de prueba basados en los DTOs
    mockFlight = {
      id: "flight1",
      parentId: "parent1",
      eventId: "event1",
      departure: "New York",
      destination: "Los Angeles",
      departureTime: new Date().toISOString() as any,
      arrivalTime: new Date().toISOString() as any,
      airline: "Delta",
      flightNumber: "DL123",
      cost: 300,
    };

    mockFlights = [mockFlight];

    // ✅ Configurar mocks para los servicios
    (flightsService.createFlight as jest.Mock).mockResolvedValue(mockFlight);
    (flightsService.getAllFights as jest.Mock).mockResolvedValue(mockFlights);
    (flightsService.getByIdFlight as jest.Mock).mockResolvedValue(mockFlight);
    (flightsService.updateFlight as jest.Mock).mockResolvedValue(mockFlight);
    (flightsService.deleteFlight as jest.Mock).mockResolvedValue({ message: "Flight deleted" });
    (flightsService.deleteManyFlights as jest.Mock).mockResolvedValue({ message: "Flights deleted" });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Restaurar los mocks después de cada prueba
  });

  test("POST /flights/create - debería crear un vuelo", async () => {
    const response = await request(app)
      .post("/api/v1/flights/create")
      .send(mockFlight)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFlight);
  });

  test("GET /flights/getall - debería devolver todos los vuelos", async () => {
    const response = await request(app)
      .get("/api/v1/flights/getall")
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.length).toBe(mockFlights.length);
    expect(response.body[0].departure).toBe("New York");
  });

  test("GET /flights/getById/:userId/:flightId - debería devolver un vuelo por ID", async () => {
    const response = await request(app)
      .get(`/api/v1/flights/getById/testUser/${mockFlight.id}`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFlight);
  });

  test("PUT /flights/update - debería actualizar un vuelo", async () => {
    const updatedFlight = { ...mockFlight, airline: "American Airlines" };
    (flightsService.updateFlight as jest.Mock).mockResolvedValue(updatedFlight);

    const response = await request(app)
      .put("/api/v1/flights/update")
      .send(updatedFlight)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.airline).toBe("American Airlines");
  });

  test("DELETE /flights/delete/:userId/:flightId - debería eliminar un vuelo", async () => {
    const response = await request(app)
      .delete(`/api/v1/flights/delete/testUser/${mockFlight.id}`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Flight deleted");
  });

  // ✅ Pruebas de error
  test("POST /flights/create - debería devolver error 500 si hay un fallo", async () => {
    (flightsService.createFlight as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .post("/api/v1/flights/create")
      .send(mockFlight)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(500);
  });

  test("GET /flights/getById/:userId/:flightId - debería devolver error 500 si el vuelo no existe", async () => {
    (flightsService.getByIdFlight as jest.Mock).mockRejectedValue(new Error("Flight not found"));

    const response = await request(app)
      .get(`/api/v1/flights/getById/testUser/${mockFlight.id}`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(500);
  });
});
