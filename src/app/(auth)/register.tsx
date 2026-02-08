import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { ScreenLoader } from "@/src/components/molecules/ScreenLoader";
import { useRegister } from "@/src/features/auth/hooks/useRegister";
import { useTheme } from "@/src/hooks/useTheme";
import { Link } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { colors } = useTheme();

  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleRegister,
  } = useRegister();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScreenLoader
        visible={isLoading}
        variant="fullscreen"
        text="Sedang menyiapkan dompet digital Anda..."
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <AppText variant="h1" weight="bold" className="mb-2">
            Buat Akun Baru 🚀
          </AppText>
          <AppText variant="body">
            Mulai perjalanan finansial sehat Anda hari ini.
          </AppText>
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
          <AppText variant="body">Sudah punya akun? </AppText>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <AppText variant="body" weight="bold">
                Masuk
              </AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
