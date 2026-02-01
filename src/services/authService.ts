import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { RegisterPayload, UserProfile } from "../types/user";
import { AnalyticsService } from "./AnalyticsService";
import { SecurityService } from "./SecurityService";

export const AuthService = {
  login: async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await AuthService._updateLastLogin(cred.user.uid);
      AnalyticsService.logEvent("login", { method: "email" });
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
      AnalyticsService.logEvent("sign_up", { method: "email" });
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
      AnalyticsService.logEvent("login", { method: "google" });
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
      emailVerified: true,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: { currency: "IDR", theme: "system" },
    });
  },

  _updateLastLogin: async (uid: string) => {
    await updateDoc(doc(db, "users", uid), { lastLoginAt: Date.now() });
  },

  ensureEmailVerified: async (uid: string) => {
    await updateDoc(doc(db, "users", uid), { emailVerified: true });
  },

  updatePushToken: async (uid: string, token: string) => {
    await updateDoc(doc(db, "users", uid), { pushToken: token });
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

  /**
   * Delete user account and all associated data.
   * Required by Apple App Store guidelines.
   */
  deleteAccount: async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Tidak ada user yang login.");
    }

    const uid = user.uid;

    try {
      // Collections to delete (all user data)
      const collectionsToDelete = [
        "transactions",
        "wallets",
        "subscriptions",
        "debts",
        "wishlists",
        "templates",
        "categories",
      ];

      // Delete all documents in each collection that belong to this user
      for (const collectionName of collectionsToDelete) {
        const q = query(
          collection(db, collectionName),
          where("userId", "==", uid),
        );
        const snapshot = await getDocs(q);

        // Use batched writes for efficiency (max 500 per batch)
        const batchSize = 500;
        let batch = writeBatch(db);
        let count = 0;

        for (const docSnapshot of snapshot.docs) {
          batch.delete(docSnapshot.ref);
          count++;

          if (count >= batchSize) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }

        // Commit remaining deletes
        if (count > 0) {
          await batch.commit();
        }
      }

      // Delete user profile document
      await deleteDoc(doc(db, "users", uid));

      // Clear local security data (PIN, biometric settings)
      await SecurityService.clearAll();

      // Delete the Firebase Auth user account
      await deleteUser(user);
    } catch (error: any) {
      // If deletion fails due to requiring recent authentication
      if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Untuk keamanan, silakan logout dan login kembali sebelum menghapus akun.",
        );
      }
      throw new Error("Gagal menghapus akun: " + error.message);
    }
  },
};
