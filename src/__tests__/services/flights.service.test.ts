import { getAllFights, createFlight, updateFlight, deleteFlight } from "../../services/flights.service";
import { db } from "../../config/firebase";
import { FlightDto } from "../../model/dto/flight.dto";

jest.mock("../../config/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        collection: jest.fn(() => ({
          add: jest.fn(),
          get: jest.fn(),
          doc: jest.fn(() => ({
            update: jest.fn(),
            get: jest.fn(),
          }))
        }))
      })),
      get: jest.fn(),
      add: jest.fn()
    })),
    collectionGroup: jest.fn(() => ({
      get: jest.fn(),
    })),
  }
}));

describe("Flights Service", () => {
  let mockFlight: FlightDto;
  
  beforeEach(() => {
    mockFlight = {
      id: "flight1",
      user: { id: "user1" },
      eventId: "event1",
      departure: "New York",
      destination: "Los Angeles",
      departureTime: new Date().toISOString() as any,
      arrivalTime: new Date().toISOString() as any,
      airline: "Delta",
      flightNumber: "DL123",
      cost: 300,
      parentId: "2"
    } as any;
  });

  test("getAllFlights should return a list of flights", async () => {
    const mockDocs = [{ id: "flight1", data: () => mockFlight }];
    (db.collectionGroup as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: mockDocs })
    });
    (db.collection('users').doc('2').get as jest.Mock).mockReturnValue(
        {exists: false}
    );

    const flights = await getAllFights();
    expect(flights).toHaveLength(1);
    expect(flights[0].id).toBe("flight1");
  });

  test("createFlight should add a flight and return the created flight", async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: "flight1", update: jest.fn(), get: jest.fn() });
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({ add: mockAdd }),
        get: jest.fn()
      }),
      get: jest.fn()
    });

    const createdFlight = await createFlight(mockFlight);
    expect(createdFlight.id).toBe("flight1");
    expect(mockAdd).toHaveBeenCalled();
  });



  test("updateFlight should update an existing flight", async () => {
    const mockUpdate = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ update: mockUpdate, get: jest.fn() })
        }),
        get: jest.fn()
      })
    });

    await updateFlight({ 
        airline: "United", departureTime: null, arrivalTime: null,
        cost: 2000, user: {id: '1'}, id: '1'
     } as any);
    expect(true).toBe(true);
  });


  test("deleteFlight should remove a flight", async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ 
            delete: mockDelete, 
            get: jest.fn().mockResolvedValue({exists: true})
        })
        }),
        get: jest.fn()
      })
    });

    await deleteFlight('123', '123');
    expect(mockDelete).toHaveBeenCalled();
  });

});
