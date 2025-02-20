import { getStaffDashboard, getStats, getUsersWithActiveEvents, getUsersWithoutActiveEvents } from '../../services/dashboard.service';

jest.mock("firebase-admin", () => {
    return {
      initializeApp: jest.fn(),
      credential: {
        cert: jest.fn(),
      },
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ docs: [] })), // Simula colección vacía
              })),
            })),
            
            get: jest.fn(() => Promise.resolve({ docs: [] })), // Simula colección vacía
          })),
          doc: jest.fn(() => ({
            collection: jest.fn(() => ({
              where: jest.fn(() => ({
                orderBy: jest.fn(() => ({
                  limit: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({ docs: [] })), // Mock para subcolecciones
                  })),
                })),
              })),
              get: jest.fn(() => Promise.resolve({ docs: [] })),
            })),
            get: jest.fn(() => Promise.resolve({ exists: true, data: jest.fn(() => ({})) })),
          })),
          get: jest.fn(() => Promise.resolve({ docs: [] })), // Mock para get()
        })),
        collectionGroup: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })), // Mock para collectionGroup()
        })),
      })),
      auth: jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: "testUser", role: "ADMIN" }),
      })),
    };
  });
  

describe("Service Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getStats should return default statsDto object", async () => {
    const result = await getStats();
    expect(result).toEqual({
      staffHired: 0,
      eventsRegistered: 0,
      totalActiveEvents: 0,
      totalClosedEvents: 0,
      totalHotelExpensesForActiveEvents: 0,
      totalHotelExpensesForClosedEvents: 0,
      totalFlightExpensesForActiveEvents: 0,
      totalFlightExpensesForClosedEvents: 0,
      staffHiredWithActiveEvents: 0,
    });
  });

  test("getStaffDashboard should return default empty arrays", async () => {
    const userId = "testUser";
    const result = await getStaffDashboard(userId);
    expect(result).toEqual({
      upcomingFlights: [],
      upcomingHotels: [],
      upcomingEvents: [],
    });
  });

  test("getUsersWithoutActiveEvents should return empty array when no users", async () => {
    const result = await getUsersWithoutActiveEvents();
    expect(result).toEqual([]);
  });

  test("getUsersWithActiveEvents should return empty array when no users have active events", async () => {
    const result = await getUsersWithActiveEvents();
    expect(result).toEqual([]);
  });
});
