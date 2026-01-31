// Mock Firebase
jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithCredential: jest.fn(),
}));
jest.mock("@firebase/auth", () => ({ getReactNativePersistence: jest.fn() }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(() => ({
    delete: jest.fn(),
    commit: jest.fn(),
  })),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("@/src/config/firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "user123" } },
}));
jest.mock("@sentry/react-native", () => ({}));
jest.mock("../src/services/AnalyticsService", () => ({
  AnalyticsService: { logEvent: jest.fn() },
}));
jest.mock("../src/services/SecurityService", () => ({
  SecurityService: { clearAll: jest.fn() },
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDoc, setDoc } from "firebase/firestore";
import { AuthService } from "../src/services/authService";

describe("AuthService", () => {
  const email = "test@example.com";
  const pass = "password123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should call signInWithEmailAndPassword", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: { uid: "uid123" },
      });
      await AuthService.login(email, pass);
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("should create auth user and profile", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: { uid: "uid123" },
      });
      await AuthService.register({
        email,
        password: pass,
        fullName: "Test User",
      });
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe("getUserProfile", () => {
    it("should return data if user exists", async () => {
      const mockData = { displayName: "Test" };
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData,
      });

      const profile = await AuthService.getUserProfile("uid123");
      expect(profile).toEqual(mockData);
    });

    it("should throw if user doesn't exist", async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      await expect(AuthService.getUserProfile("uid123")).rejects.toThrow(
        "Profil akun tidak ditemukan.",
      );
    });
  });
});
