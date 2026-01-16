import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { AuthService } from "@/src/services/authService";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      await AuthService.register({
        email,
        password,
        fullName,
      });

      Toast.show({
        type: "success",
        text1: "Berhasil!",
        text2: "Anda berhasil mendaftar.",
      });
    } catch (error: any) {
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
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View className="mb-8">
          <AppText variant="h1" weight="bold" className="mb-2">
            Buat Akun Baru 🚀
          </AppText>
          <AppText>Mulai perjalanan finansial sehat Anda hari ini.</AppText>
        </View>

        <View className="gap-y-4">
          <AppInput
            label="Nama Lengkap"
            placeholder="Jhon Doe"
            value={fullName}
            onChangeText={setFullName}
          />

          <AppInput
            label="Email"
            placeholder="contoh@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View>
            <AppInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              containerClass="mb-1"
            />
            <AppText variant="caption" className="ml-1">
              Minimal 6 karakter
            </AppText>
          </View>

          <AppButton
            title="Daftar Akun"
            onPress={handleRegister}
            isLoading={isLoading}
            className="mt-4"
          />
        </View>

        <View className="flex-row justify-center mt-8 items-center">
          <AppText>Sudah punya akun? </AppText>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <AppText weight="bold">Masuk</AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
