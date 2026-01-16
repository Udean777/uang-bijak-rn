import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { RegisterPayload, UserProfile } from "../types/user";

export const AuthService = {
  login: async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await AuthService._updateLastLogin(cred.user.uid);
    } catch (error: any) {
      throw new Error("Email atau password salah.");
    }
  },

  register: async ({ email, password, fullName }: RegisterPayload) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });

      await AuthService._createUserProfile(cred.user.uid, {
        email,
        displayName: fullName,
        photoURL: "",
      });
    } catch (error: any) {
      throw new Error(error.message || "Gagal mendaftar.");
    }
  },

  loginWithGoogle: async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      const user = userCredential.user;

      await AuthService._handleSocialUser(user);
    } catch (error: any) {
      throw new Error("Gagal login Google: " + error.message);
    }
  },

  _handleSocialUser: async (user: any) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await AuthService._createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
      });
    } else {
      await AuthService._updateLastLogin(user.uid);
    }
  },

  _createUserProfile: async (uid: string, data: any) => {
    await setDoc(doc(db, "users", uid), {
      uid,
      ...data,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: { currency: "IDR", theme: "system" },
    });
  },

  _updateLastLogin: async (uid: string) => {
    await updateDoc(doc(db, "users", uid), { lastLoginAt: Date.now() });
  },

  logout: async () => {
    await signOut(auth);
  },

  getUserProfile: async (uid: string): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    throw new Error("Profil akun tidak ditemukan.");
  },
};
