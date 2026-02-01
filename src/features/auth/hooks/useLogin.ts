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
        handleGoogleSignIn(id_token);
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
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Mohon isi email dan password",
      });
      return;
    }

    try {
      await login(email, password);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal Masuk",
        text2: error.message,
      });
    }
  };

  const handleGoogleSignIn = async (token: string) => {
    try {
      await loginWithGoogle(token);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Google Error",
        text2: error.message,
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
