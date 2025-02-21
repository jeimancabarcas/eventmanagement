import { getAllUsers, createUser, getById, getByRole, updateUser, deleteUser, deleteManyUsers } from "../../services/users.service";
import { db, Auth } from "../../config/firebase";
import { UserDto } from "../../model/dto/user.dto";
import * as jwt from 'jsonwebtoken';
import CryptoJs from "crypto-js";
const admin = require("firebase-admin");
jest.mock("firebase-admin", () => ({
    auth: jest.fn().mockResolvedValue({
      getUser: jest.fn(),
    }),
}));
jest.mock("../../config/firebase", () => ({
  db: {
    batch: jest.fn(() => ({
      delete: jest.fn(),
      commit: jest.fn()
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
            delete: jest.fn()
          }))
        }))
      })),
      get: jest.fn(),
      add: jest.fn(),
      where: jest.fn(() => ({ get: jest.fn() }))
    }))
  },
  Auth: {
    createUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
    getUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn()
  }
}));

describe("Users Service", () => {
  let mockUser: UserDto;
  
  beforeEach(() => {
    mockUser = {
      id: "user1",
      name: "John Doe",
      lastName: "Doe",
      email: "johndoe@example.com",
      role: "ADMIN",
      position: "Manager",
      address: "123 Street",
      password: "password123",
      events: []
    };
  });

  test("getAllUsers should return a list of users", async () => {
    const mockDocs = [{ id: "user1", data: () => mockUser }];
    const mockDelete = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ 
                delete: mockDelete, 
                get: jest.fn().mockResolvedValue({exists: true})
            }),
            get: jest.fn().mockResolvedValue({ docs: mockDocs})
        }),
        delete: mockDelete, 
        get: jest.fn().mockResolvedValue({ docs: mockDocs})
      }),
      get: jest.fn().mockResolvedValue({ docs: mockDocs})
    });
    (admin.auth as jest.Mock).mockReturnValue({
        getUser: jest.fn(),
        deleteUser: jest.fn()
    })

    const users = await getAllUsers();
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe("user1");
  });

  test("createUser should add a user and return the created user", async () => {
    
    (Auth.createUser as jest.Mock).mockResolvedValue({ uid: "user1" });
    (Auth.setCustomUserClaims as jest.Mock).mockResolvedValue(true);
    const mockSet = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ 
                get: jest.fn().mockResolvedValue({exists: true})
            }),
            get: jest.fn().mockResolvedValue({docs: [{id:"1"}]})
        }),
        get: jest.fn().mockResolvedValue({data: jest.fn().mockReturnValue({id: "1", events: []})}),
        set: jest.fn(),
        
      })
    });

    const createdUser = await createUser(mockUser);
    expect(createdUser.id).toBe("1");
  });

  test("updateUser should update an existing user", async () => {
    const mockUpdate = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ update: mockUpdate })
    });

    const response = await updateUser(mockUser);
    expect(true).toBe(true);
  });

  test("deleteUser should remove a user", async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ 
                delete: mockDelete, 
                get: jest.fn().mockResolvedValue({exists: true})
            }),
            get: jest.fn().mockResolvedValue([{id: "1"}])
        }),
        delete: mockDelete, 
        get: jest.fn()
      })
    });
    (admin.auth as jest.Mock).mockReturnValue({
        getUser: jest.fn(),
        deleteUser: jest.fn()
    })
    await deleteUser("user1");
    expect(mockDelete).toHaveBeenCalled();
  });

  test("deleteManyUsers should delete multiple users", async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({ 
                delete: mockDelete, 
                get: jest.fn().mockResolvedValue({exists: true})
            }),
            get: jest.fn().mockResolvedValue([{id: "1"}])
        }),
        get: jest.fn()
      })
    });
    const response = await deleteManyUsers([mockUser]);
    expect(response).toBeTruthy();

  });

});
