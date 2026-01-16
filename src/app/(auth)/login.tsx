import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { AuthService } from "@/src/services/authService";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: "Mohon isi semua kolom.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.login(email, password);

      Toast.show({
        type: "success",
        text1: "Berhasil!",
        text2: "Anda berhasil masuk.",
      });
    } catch (error: any) {
      console.error("Gagal login:", error.message);
      Toast.show({
        type: "error",
        text1: "Gagal!",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white justify-center p-6"
    >
      <View className="mb-10">
        <AppText variant="h1" weight="bold" className="mb-2">
          Selamat Datang Kembali 👋
        </AppText>
        <AppText color="secondary">
          Masuk untuk mengelola keuangan Anda.
        </AppText>
      </View>

      <View className="gap-y-4">
        <AppInput
          label="Email"
          placeholder="contoh@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <AppInput
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AppButton
          title="Masuk"
          onPress={handleLogin}
          isLoading={isLoading}
          className="mt-4"
        />
      </View>

      <View className="flex-row justify-center mt-8 items-center">
        <AppText color="secondary">Belum punya akun? </AppText>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <AppText color="primary" weight="bold">
              Daftar Sekarang
            </AppText>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
