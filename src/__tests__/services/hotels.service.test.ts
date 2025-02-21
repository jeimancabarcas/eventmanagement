import { getAllHotels, createHotel, getByIdHotel, updateHotel, deleteHotel, deleteManyHotels } from "../../../src/services/hotel.service";
import { db } from "../../../src/config/firebase";
import { HotelDto } from "../../../src/model/dto/hotel.dto";

jest.mock("../../config/firebase", () => ({
    db: {
        batch: jest.fn(() => ({
            delete: jest.fn(),
            commit: jest.fn(),
        })),
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

describe("Hotels Service", () => {
  let mockHotel: HotelDto;
  
  beforeEach(() => {
    mockHotel = {
      id: "hotel1",
      user: { id: "user1" },
      eventId: "event1",
      name: "Grand Hotel",
      country: "USA",
      city: "New York",
      address: "123 Main St",
      bookingCode: "ABC123",
      room: "101",
      checkIn: null as any,
      checkOut: null as any,
      cost: 200,
      parentId: "2"
    } as any;
  });

  test("getAllHotels should return a list of hotels", async () => {
    const mockDocs = [{ id: "hotel1", data: () => mockHotel }];
    (db.collectionGroup as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: mockDocs })
    });
    (db.collection('users').doc('2').get as jest.Mock).mockReturnValue(
        {exists: false}
    );

    const hotels = await getAllHotels();
    expect(hotels).toHaveLength(1);
    expect(hotels[0].id).toBe("hotel1");
  });

  test("createHotel should add a hotel and return the created hotel", async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: "hotel1", update: jest.fn(), get: jest.fn() });
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({ add: mockAdd }),
        get: jest.fn()
      }),
      get: jest.fn()
    });

    const createdHotel: any = await createHotel(mockHotel);
    expect(createdHotel.id).toBe("hotel1");
    expect(mockAdd).toHaveBeenCalled();
  });

  test("getByIdHotel should return a single hotel by ID", async () => {
    const mockGet = jest.fn().mockResolvedValue({ exists: true, data: () => mockHotel });
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ get: mockGet })
        }),
        get: jest.fn()
      })
    });

    const hotel = await getByIdHotel("user1", "hotel1");
    expect(hotel.id).toBe("hotel1");
    expect(mockGet).toHaveBeenCalled();
  });

  test("updateHotel should update an existing hotel", async () => {
    const mockUpdate = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ update: mockUpdate, get: jest.fn() })
        }),
        get: jest.fn()
      })
    });
    await updateHotel(mockHotel);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: "Grand Hotel" }));
  });

  test("deleteHotel should remove a hotel", async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ 
            delete: mockDelete, 
            get: jest.fn().mockResolvedValue({exists: true})
            }),
            get: jest.fn()
        }),
        get: jest.fn()
      })
    });
    const response = await deleteHotel("user1", "hotel1");
    expect(response).toBeTruthy();
  });

  test("deleteManyHotels should delete multiple hotels", async () => {
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn()
    });
    const response = await deleteManyHotels(["1", "2"]);
    expect(response).toBeTruthy();
  });

});
