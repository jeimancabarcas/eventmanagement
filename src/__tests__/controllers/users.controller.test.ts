import request from "supertest";
import app from "../../app"; // Se importa la instancia de Express
import * as userService from "../../../src/services/users.service";
import { DtoToken } from "../../../src/model/doc/token";
import { UserDto } from "../../../src/model/dto/user.dto";

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

// ✅ Mockear los servicios de usuarios para evitar conexiones reales
jest.mock("../../../src/services/users.service");

describe("User Controller", () => {
  let mockUser: UserDto;
  let mockUsers: UserDto[];

  beforeEach(() => {
    // ✅ Datos de prueba basados en los DTOs
    mockUser = {
      id: "user1",
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      role: "ADMIN",
    };

    mockUsers = [mockUser];

    // ✅ Configurar mocks para los servicios
    (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
    (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (userService.getById as jest.Mock).mockResolvedValue(mockUser);
    (userService.getByRole as jest.Mock).mockResolvedValue(mockUsers);
    (userService.updateUser as jest.Mock).mockResolvedValue(mockUser);
    (userService.deleteUser as jest.Mock).mockResolvedValue({ message: "User deleted" });
    (userService.deleteManyUsers as jest.Mock).mockResolvedValue({ message: "Users deleted" });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Restaurar los mocks después de cada prueba
  });

  test("GET /users/getall - debería devolver todos los usuarios", async () => {
    const response = await request(app)
      .get("/api/v1/users/getall")
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.length).toBe(mockUsers.length);
    expect(response.body[0].name).toBe("John Doe");
  });

  test("GET /users/getByRole/:role - debería devolver usuarios por rol", async () => {
    const response = await request(app)
      .get(`/api/v1/users/getByRole/ADMIN`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.length).toBe(mockUsers.length);
  });

  test("POST /users/create - debería crear un usuario", async () => {
    const response = await request(app)
      .post("/api/v1/users/create")
      .send(mockUser)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.User).toEqual(mockUser);
  });

  test("GET /users/get/:id - debería devolver un usuario por ID", async () => {
    const response = await request(app)
      .get(`/api/v1/users/get/${mockUser.id}`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body["User finded"]).toEqual(mockUser);
  });

  test("PUT /users/update - debería actualizar un usuario", async () => {
    const updatedUser = { ...mockUser, name: "Updated Name" };
    (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

    const response = await request(app)
      .put("/api/v1/users/update")
      .send(updatedUser)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body["User"].name).toBe("Updated Name");
  });

  test("DELETE /users/delete/:id - debería eliminar un usuario", async () => {
    const response = await request(app)
      .delete(`/api/v1/users/delete/${mockUser.id}`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User deleted");
  });

  test("DELETE /users/deleteMany - debería eliminar múltiples usuarios", async () => {
    const response = await request(app)
      .delete("/api/v1/users/deleteMany")
      .send({ ids: [mockUser.id] })
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Users deleted");
  });

  test("GET /users/get/:id - debería devolver error 500 si el usuario no existe", async () => {
    (userService.getById as jest.Mock).mockRejectedValue(new Error("User not found"));

    const response = await request(app)
      .get(`/api/v1/users/get/${mockUser.id}`)
      .set("Authorization", "Bearer valid-token");


    expect(response.status).toBe(500);
  });
});
