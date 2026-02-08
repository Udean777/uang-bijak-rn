import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
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
import { COLLECTIONS } from "../constants/firebaseCollections";
import { MESSAGES } from "../constants/messages";
import { RegisterPayload, UserProfile } from "../types/user";
import { getErrorMessage } from "../utils/errorUtils";
import { AnalyticsService } from "./AnalyticsService";
import { SecurityService } from "./SecurityService";

export const AuthService = {
  login: async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await AuthService._updateLastLogin(cred.user.uid);
      AnalyticsService.logEvent("login", { method: "email" });
      return cred.user;
    } catch (error: unknown) {
      throw new Error(MESSAGES.AUTH.LOGIN_FAILED);
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
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  loginWithGoogle: async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      const user = userCredential.user;

      await AuthService._handleSocialUser(user);
      AnalyticsService.logEvent("login", { method: "google" });
      return user;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      throw new Error(MESSAGES.AUTH.GOOGLE_LOGIN_FAILED + msg);
    }
  },

  _handleSocialUser: async (user: User) => {
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await AuthService._createUserProfile(user.uid, {
        email: user.email || "",
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
      });
    } else {
      await AuthService._updateLastLogin(user.uid);
    }
  },

  _createUserProfile: async (
    uid: string,
    data: Pick<UserProfile, "email" | "displayName" | "photoURL">,
  ) => {
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      uid,
      ...data,
      emailVerified: true,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: { currency: "IDR", theme: "system" },
    });
  },

  _updateLastLogin: async (uid: string) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      lastLoginAt: Date.now(),
    });
  },

  ensureEmailVerified: async (uid: string) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { emailVerified: true });
  },

  updatePushToken: async (uid: string, token: string) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { pushToken: token });
  },

  logout: async () => {
    await signOut(auth);
  },

  getUserProfile: async (uid: string): Promise<UserProfile> => {
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);

    for (let i = 0; i < 3; i++) {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      if (i < 2) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
  },

  /**
   * Delete user account and all associated data.
   * Required by Apple App Store guidelines.
   */
  deleteAccount: async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error(MESSAGES.AUTH.NO_USER_LOGGED_IN);
    }

    const uid = user.uid;

    try {
      // Collections to delete (all user data)
      const collectionsToDelete = [
        COLLECTIONS.TRANSACTIONS,
        COLLECTIONS.WALLETS,
        COLLECTIONS.SUBSCRIPTIONS,
        COLLECTIONS.DEBTS,
        COLLECTIONS.WISHLISTS,
        COLLECTIONS.TEMPLATES,
        COLLECTIONS.CATEGORIES,
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
      await deleteDoc(doc(db, COLLECTIONS.USERS, uid));

      // Clear local security data (PIN, biometric settings)
      await SecurityService.clearAll();

      // Delete the Firebase Auth user account
      await deleteUser(user);
    } catch (error: unknown) {
      // If deletion fails due to requiring recent authentication
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "auth/requires-recent-login"
      ) {
        throw new Error(MESSAGES.AUTH.REAUTH_REQUIRED);
      }
      throw new Error(
        MESSAGES.AUTH.DELETE_ACCOUNT_FAILED + getErrorMessage(error),
      );
    }
  },
};
