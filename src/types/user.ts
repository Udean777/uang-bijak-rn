export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
  emailVerified?: boolean;
  preferences: {
    currency: string;
    language: "id" | "en";
    theme: "light" | "dark" | "system";
  };
  pushToken?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}
