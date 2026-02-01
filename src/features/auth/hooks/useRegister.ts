import { useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";

export const useRegister = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: "Mohon isi semua kolom.",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: "Password minimal 6 karakter.",
      });
      return;
    }

    try {
      await register({
        email,
        password,
        fullName,
      });

      Toast.show({
        type: "success",
        text1: "Berhasil!",
        text2: "Akun Anda telah dibuat.",
      });

      // Redirect ke main tabs (layout will redirect to PIN setup if needed)
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: error.message,
      });
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleRegister,
  };
};
