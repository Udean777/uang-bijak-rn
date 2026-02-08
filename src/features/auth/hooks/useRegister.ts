import { registerSchema } from "@/src/schemas/authSchema";
import { getErrorMessage } from "@/src/utils/errorUtils";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
    });

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;

      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: errorMessage,
      });

      return;
    }

    setIsSubmitting(true);

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

      router.replace("/(tabs)");
    } catch (error: unknown) {
      setIsSubmitting(false);

      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: getErrorMessage(error),
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
    isLoading: isSubmitting,
    handleRegister,
  };
};
