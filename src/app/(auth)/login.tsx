import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { useLogin } from "@/src/features/auth/hooks/useLogin";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { colors } = useTheme();

  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleEmailLogin,
    googleRequest,
    promptGoogleSignIn,
  } = useLogin();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
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
            Selamat Datang 👋
          </AppText>
          <AppText variant="body">Masuk untuk mengelola keuangan Anda.</AppText>
        </View>

        <View className="gap-y-2">
          <AppInput
            label="Email"
            placeholder="contoh@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
            onPress={handleEmailLogin}
            isLoading={isLoading}
            className="mt-4"
          />
        </View>

        <View className="flex-row items-center my-6">
          <View
            className="flex-1 h-[1px]"
            style={{ backgroundColor: colors.border }}
          />
          <AppText variant="caption" className="mx-4">
            atau
          </AppText>
          <View
            className="flex-1 h-[1px]"
            style={{ backgroundColor: colors.border }}
          />
        </View>

        <AppButton
          title="Lanjutkan dengan Google"
          variant="outline"
          disabled={!googleRequest || isLoading}
          onPress={promptGoogleSignIn}
          leftIcon={
            <Ionicons name="logo-google" size={20} color={colors.text} />
          }
        />

        <View className="flex-row justify-center mt-8">
          <AppText>Belum punya akun? </AppText>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <AppText weight="bold">Daftar Sekarang</AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
