import { loginSchema } from "@/src/schemas/authSchema";
import { getErrorMessage } from "@/src/utils/errorUtils";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle, isLoading } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    } else if (response?.type === "error") {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Login Google Dibatalkan",
      });
    }
  }, [response]);

  const handleEmailLogin = async () => {
    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: validation.error.issues[0].message,
      });

      return;
    }

    try {
      await login(email, password);
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Login Gagal",
        text2: getErrorMessage(error),
      });
    }
  };

  const handleGoogleLogin = async (token: string) => {
    try {
      await loginWithGoogle(token);
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: "Login Gagal",
        text2: getErrorMessage(error),
      });
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleEmailLogin,
    googleRequest: request,
    promptGoogleSignIn: () => promptAsync(),
  };
};
