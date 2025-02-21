import { getAllEvents, getComingEvents, createEvent, getByIdEvent, updateEvent, deleteEvent, deleteManyEvents } from "../../services/event.service";
import { db } from "../../config/firebase";
jest.mock("../../config/firebase", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  db: {
    batch: jest.fn(() => ({
      delete: jest.fn(),
      commit: jest.fn(),

    })),
    collection: jest.fn(() => mockData)
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: "testUser", role: "ADMIN" }),
  })),
}));
let mockData: any = {}
describe("Event Service", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // 🔹 Restaura los mocks después de cada test
  });

  test("getAllEvents should return events", async () => {

    mockData = {
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [{ id: "2", data: () => ({ name: "user" }) }],
          }))
        })),
        get: jest.fn(() => ({
          docs: [{ id: "2", data: () => ({ name: "e" }) }],
        }))
      })),
      get: jest.fn(() => ({
        docs: [{ id: "2", data: () => ({ name: "Event 1" }) }],
      }))
    }


    const events = await getAllEvents();
    
    expect(events.length).toBe(1);
    expect(events[0].id).toBe("2");
    expect(events[0].name).toBe("Event 1");

  });

  test("getComingEvents should return upcoming events", async () => {

    mockData = {
      where: jest.fn(() => ({
          get: jest.fn(() => ({
          docs: [{ id: "2", data: () => ({ name: "e" }) }],
        }))
      })),
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [{ id: "2", data: () => ({ name: "user" }) }],
          }))
        })),
        get: jest.fn(() => ({
          docs: [{ id: "2", data: () => ({ name: "e" }) }],
        }))
      })),
      get: jest.fn(() => ({
        docs: [{ id: "2", data: () => ({ name: "Event 1" }) }],
      }))
    }
    const events = await getComingEvents();
    expect(events.length).toBe(1);
    expect(events[0].id).toBe("2");
  });

  test("createEvent should add an event and return it", async () => {
    db.collection("events").add = jest.fn();
    const mockAdd = jest.spyOn(db.collection("events"), "add").mockResolvedValue({
      id: "3",
      get: jest.fn().mockResolvedValue({
        data: () => ({
          name: "New Event",
          start_date: new Date(),
          end_date: new Date(),
          place: "Venue",
        }),
      }),
    } as any);

    const event = await createEvent({
      name: "New Event",
      start_date: new Date(),
      end_date: new Date(),
      place: "Venue",
    } as any);

    expect(event.id).toBe("3");
    expect(event.name).toBe("New Event");

    mockAdd.mockRestore();
  });

  test("getByIdEvent should return an event by ID", async () => {
    const mockData = {
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [{ id: "2", data: () => ({ name: "user" }) }],
          }))
        })),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ id: "4", name: "Event by ID" })
        })
      }))
    };

    db.collection = jest.fn(() => mockData) as any;
    const event = await getByIdEvent("4");
    expect(event).toBeDefined();
    expect(event?.id).toBe("4");
    expect(event?.name).toBe("Event by ID");
  });

  test("updateEvent should update and return the event", async () => {
    const mockData = {
      get: jest.fn(() => {
        [{ id: "4", name: "Event by ID" }]
      }),
      doc: jest.fn(() => ({
        update: jest.fn(),
        collection: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [{ id: "2", data: () => ({ name: "user" }) }]
          }))
        })),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ id: "5", name: "Updated Event" })
        })
      }))
      
    };
    
    
    db.collection = jest.fn(() => mockData) as any;

    const updatedEvent = await updateEvent({ id: "5", name: "Updated Event", start_date: new Date(), end_date: new Date(), place: "Updated Venue" } as any);
    expect(updatedEvent?.id).toBe("5");
    expect(updatedEvent?.name).toBe("Updated Event");

  });

  test("deleteEvent should return true on successful deletion", async () => {
    const mockData = {
      get: jest.fn(() => {
        [{ id: "4", name: "Event by ID" }]
      }),
      doc: jest.fn(() => ({
        delete: jest.fn(),
        collection: jest.fn(() => ({
          get: jest.fn(() => (
            [{ id: "2", data: () => ({ name: "user" }) }]
          ))
        })),
      }))
      
    };
    
    
    db.collection = jest.fn(() => mockData) as any;
    db.collection("events").doc("6").delete = jest.fn();
    const mockDelete = jest.spyOn(db.collection("events").doc("6"), "delete").mockResolvedValue(undefined as any);

    const result = await deleteEvent("6");
    expect(result).toBe(true);

    mockDelete.mockRestore();
  });

  test("deleteManyEvents should return true on successful batch deletion", async () => {
    const mockData = {
      get: jest.fn(() => {
        [{ id: "4", name: "Event by ID" }]
      }),
      doc: jest.fn(() => ({
        delete: jest.fn(),
        collection: jest.fn(() => ({
          get: jest.fn(() => (
            [{ id: "2", data: () => ({ name: "user" }) }]
          ))
        })),
      }))
      
    };
    
    
    db.collection = jest.fn(() => mockData) as any;
    const mockDelete1 = jest.spyOn(db.collection("events").doc("7"), "delete").mockResolvedValue(undefined as any);
    const mockDelete2 = jest.spyOn(db.collection("events").doc("8"), "delete").mockResolvedValue(undefined as any);

    const result = await deleteManyEvents(["7", "8"]);
    expect(result).toBe(true);

    mockDelete1.mockRestore();
    mockDelete2.mockRestore();
  });
});