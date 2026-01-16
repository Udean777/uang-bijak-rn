import { AppButton } from "@/src/components/atoms/AppButton";
import { AppInput } from "@/src/components/atoms/AppInput";
import { AppText } from "@/src/components/atoms/AppText";
import { AuthService } from "@/src/services/authService";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      await AuthService.login(email, password);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Gagal Masuk", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (token: string) => {
    setIsLoading(true);
    try {
      await AuthService.loginWithGoogle(token);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Google Error",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
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
            Selamat Datang 👋
          </AppText>
          <AppText variant="body" color="secondary">
            Masuk untuk mengelola keuangan Anda.
          </AppText>
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
          <View className="flex-1 h-[1px] bg-gray-200" />
          <AppText variant="caption" color="secondary" className="mx-4">
            atau
          </AppText>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        <AppButton
          title="Lanjutkan dengan Google"
          variant="outline"
          disabled={!request || isLoading}
          onPress={() => promptAsync()}
          leftIcon={<Ionicons name="logo-google" size={20} color="black" />}
        />

        <View className="flex-row justify-center mt-8">
          <AppText color="secondary">Belum punya akun? </AppText>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <AppText color="primary" weight="bold">
                Daftar Sekarang
              </AppText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
