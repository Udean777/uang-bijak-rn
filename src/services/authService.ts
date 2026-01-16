import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { RegisterPayload } from "../types/user";

export const AuthService = {
  register: async ({
    email,
    password,
    fullName,
  }: RegisterPayload): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: fullName,
        photoURL: "",
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        preferences: {
          currency: "IDR",
          language: "id",
          theme: "system",
        },
      };

      await setDoc(doc(db, "users", user.uid), newUserProfile);
    } catch (error: any) {
      throw new Error(error.message || "Gagal mendaftar");
    }
  },

  login: async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      updateDoc(doc(db, "users", userCredential.user.uid), {
        lastLoginAt: Date.now(),
      });
    } catch (error: any) {
      throw new Error("Email atau password salah");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || "Gagal logout");
    }
  },

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  },
};
