import request from "supertest";
import app from "../../app"; // Se importa la instancia de Express
import * as eventService from "../../../src/services/event.service";
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


// ✅ Mockear los servicios de eventos para evitar conexiones reales
jest.mock("../../../src/services/event.service");

describe("Event Controller", () => {
  let mockEvent: EventDto;
  let mockEvents: EventDto[];

  beforeEach(() => {
    // ✅ Datos de prueba basados en los DTOs
    mockEvent = {
      id: "event1",
      name: "Rock Concert",
      start_date: new Date().toISOString() as any,
      end_date: new Date().toISOString() as any,
      artist: "The Rolling Stones",
      place: "Los Angeles Stadium",
    };

    mockEvents = [mockEvent];

    // ✅ Configurar mocks para los servicios
    (eventService.createEvent as jest.Mock).mockResolvedValue(mockEvent);
    (eventService.getAllEvents as jest.Mock).mockResolvedValue(mockEvents);
    (eventService.getComingEvents as jest.Mock).mockResolvedValue(mockEvents);
    (eventService.getByIdEvent as jest.Mock).mockResolvedValue(mockEvent);
    (eventService.updateEvent as jest.Mock).mockResolvedValue(mockEvent);
    (eventService.deleteEvent as jest.Mock).mockResolvedValue({ message: "Event deleted" });
    (eventService.deleteManyEvents as jest.Mock).mockResolvedValue({ message: "Events deleted" });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Restaurar los mocks después de cada prueba
  });

  test("POST /events/create - debería crear un evento", async () => {
    const response = await request(app)
      .post("/api/v1/events/create")
      .send(mockEvent)
      .set("Authorization", "Bearer valid-token");

      // ✅ Depuración si falla

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockEvent);
  });

  test("GET /events/getall - debería devolver todos los eventos", async () => {
    const response = await request(app)
      .get("/api/v1/events/getall")
      .set("Authorization", "Bearer valid-token");

     

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(mockEvents.length);
    expect(response.body[0].name).toBe("Rock Concert");
  });

  test("GET /events/getById/:id - debería devolver un evento por ID", async () => {
    const response = await request(app)
      .get(`/api/v1/events/getById/${mockEvent.id}`)
      .set("Authorization", "Bearer valid-token");

     

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockEvent);
  });

  test("PUT /events/update - debería actualizar un evento", async () => {
    const updatedEvent = { ...mockEvent, name: "Updated Concert" };
    (eventService.updateEvent as jest.Mock).mockResolvedValue(updatedEvent);

    const response = await request(app)
      .put("/api/v1/events/update")
      .send(updatedEvent)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Concert");
  });

  test("DELETE /events/delete/:id - debería eliminar un evento", async () => {
    const response = await request(app)
      .delete(`/api/v1/events/delete/${mockEvent.id}`)
      .set("Authorization", "Bearer valid-token");

     

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Event deleted");
  });

  test("DELETE /events/deleteMany - debería eliminar múltiples eventos", async () => {
    const response = await request(app)
      .delete("/api/v1/events/deleteMany")
      .send({ ids: [mockEvent.id] })
      .set("Authorization", "Bearer valid-token");

     

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Events deleted");
  });

  // ✅ Pruebas de error
  test("POST /events/create - debería devolver error 500 si hay un fallo", async () => {
    (eventService.createEvent as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .post("/api/v1/events/create")
      .send(mockEvent)
      .set("Authorization", "Bearer valid-token");

     

    expect(response.status).toBe(500);
  });

  test("GET /events/getById/:id - debería devolver error 500 si el evento no existe", async () => {
    (eventService.getByIdEvent as jest.Mock).mockRejectedValue(new Error("Event not found"));

    const response = await request(app)
      .get(`/api/v1/events/getById/${mockEvent.id}`)
      .set("Authorization", "Bearer valid-token");

     

    expect(response.status).toBe(500);
  });
});
