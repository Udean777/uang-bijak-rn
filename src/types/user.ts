export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
  preferences: {
    currency: string;
    language: "id" | "en";
    theme: "light" | "dark" | "system";
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}
