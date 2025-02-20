import request from "supertest";
import app from "../../app"; // Se importa la instancia de Express
import * as dashboardService from "../../../src/services/dashboard.service";
import { StatsDto } from "../../../src/controllers/dashboard.controller";
import { UserDto } from "../../../src/model/dto/user.dto";
import { FlightDto } from "../../../src/model/dto/flight.dto";
import { HotelDto } from "../../../src/model/dto/hotel.dto";
import { EventDto } from "../../../src/model/dto/event.dto";

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
    verifyIdToken: jest.fn().mockImplementation((token) => {
      if (token === "valid-token") {
        return Promise.resolve({
          uid: "testUser",
          email: "test@example.com",
          role: "ADMIN", // ✅ Se devuelve un rol de prueba
        });
      }
      throw new Error("Invalid token"); // Simulación de error de autenticación
    }),
  })),
}));



// ✅ Mockear los servicios para evitar conexiones reales
jest.mock("../../../src/services/dashboard.service");

describe("Dashboard Controller", () => {
  let mockStats: StatsDto;
  let mockUsersWithoutEvents: UserDto[];
  let mockStaffDashboard: {
    upcomingFlights: FlightDto[];
    upcomingHotels: HotelDto[];
    upcomingEvents: EventDto[];
  };

  beforeEach(() => {
    // ✅ Datos de prueba basados en los DTOs
    mockStats = {
      eventsRegistered: 10,
      staffHired: 5,
      staffHiredWithActiveEvents: 3,
      totalActiveEvents: 2,
      totalClosedEvents: 1,
      totalHotelExpensesForActiveEvents: 1000,
      totalHotelExpensesForClosedEvents: 500,
      totalFlightExpensesForActiveEvents: 2000,
      totalFlightExpensesForClosedEvents: 800,
    };

    mockUsersWithoutEvents = [
      {
        id: "user1",
        name: "John",
        email: "john@example.com",
        role: "staff",
        events: [],
      },
      {
        id: "user2",
        name: "Alice",
        email: "alice@example.com",
        role: "staff",
        events: [],
      },
    ];

    mockStaffDashboard = {
      upcomingFlights: [
        {
          id: "flight1",
          parentId: "parent1",
          eventId: "event1",
          departure: "New York",
          destination: "Los Angeles",
          departureTime: new Date(),
          arrivalTime: new Date(),
          airline: "Delta",
          flightNumber: "DL123",
          cost: 300,
        } as FlightDto,
      ],
      upcomingHotels: [
        {
          id: "hotel1",
          eventId: "event1",
          name: "Hotel California",
          country: "USA",
          city: "Los Angeles",
          address: "Sunset Blvd",
          bookingCode: "XYZ123",
          room: "101",
          checkIn: new Date(),
          checkOut: new Date(),
          cost: 500,
        } as HotelDto,
      ],
      upcomingEvents: [
        {
          id: "event1",
          name: "Rock Concert",
          start_date: new Date(),
          end_date: new Date(),
          artist: "The Rolling Stones",
          place: "Los Angeles Stadium",
        } as EventDto,
      ],
    };

    // ✅ Mockear servicios para devolver los valores esperados
    (dashboardService.getStats as jest.Mock).mockResolvedValue(mockStats);
    (dashboardService.getUsersWithoutActiveEvents as jest.Mock).mockResolvedValue(
      mockUsersWithoutEvents
    );
    (dashboardService.getStaffDashboard as jest.Mock).mockResolvedValue(mockStaffDashboard);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Restaurar los mocks después de cada prueba
  });

  test("GET /stats - debería devolver estadísticas", async () => {
    const response = await request(app)
      .get("/api/v1/dashboard/stats")
      .set("Authorization", "Bearer valid-token"); // ✅ Se envía un token válido

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
  });

  test("GET /usersWithoutActiveEvents - debería devolver usuarios sin eventos activos", async () => {
    const response = await request(app)
      .get("/api/v1/dashboard/usersWithoutActiveEvents")
      .set("Authorization", "Bearer valid-token"); // ✅ Se envía un token válido

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(mockUsersWithoutEvents.length);
    expect(response.body[0].name).toBe("John");
  });

  test("GET /staffDashboard - debería devolver el dashboard del staff", async () => {
    const response = await request(app)
      .get("/api/v1/dashboard/staffDashboard")
      .set("Authorization", "Bearer valid-token");
  
    expect(response.status).toBe(200);
  
    // 🔹 Convertir fechas en `mockStaffDashboard` a strings antes de comparar
    const normalizedMockStaffDashboard = JSON.parse(JSON.stringify(mockStaffDashboard));
  
    expect(response.body).toEqual(normalizedMockStaffDashboard);
  });

  test("GET /staffDashboard - debería fallar si no hay token", async () => {
    const response = await request(app).get("/api/v1/dashboard/staffDashboard");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Token not found");
  });
});
