import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BIOMETRIC_KEY = "is_biometric_enabled";
const PIN_KEY = "user_pin";

export const SecurityService = {
  checkHardware: async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  isBiometricEnabled: async () => {
    const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
    return value === "true";
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(BIOMETRIC_KEY, String(enabled));
  },

  authenticateBiometric: async () => {
    try {
      console.log("Starting biometric authentication...");
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Buka Uang Bijak",
        cancelLabel: "Gunakan PIN",
        disableDeviceFallback: true,
      });
      console.log("Biometric Result:", JSON.stringify(result));
      if (!result.success) {
        console.log("Biometric Failed Reason:", result.error);
      }
      return result.success;
    } catch (error: unknown) {
      console.error("[SecurityService] Failed to check PIN:", error);
      return false;
    }
  },

  setPin: async (pin: string) => {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(PIN_KEY, pin);
    } else {
      await SecureStore.setItemAsync(PIN_KEY, pin);
    }
  },

  validatePin: async (inputPin: string) => {
    let storedPin: string | null = null;
    if (Platform.OS === "web") {
      storedPin = await AsyncStorage.getItem(PIN_KEY);
    } else {
      storedPin = await SecureStore.getItemAsync(PIN_KEY);
    }
    return storedPin === inputPin;
  },

  hasPin: async () => {
    let storedPin: string | null = null;
    if (Platform.OS === "web") {
      storedPin = await AsyncStorage.getItem(PIN_KEY);
    } else {
      storedPin = await SecureStore.getItemAsync(PIN_KEY);
    }
    return !!storedPin;
  },

  /**
   * Clear all security data (used when deleting account)
   */
  clearAll: async () => {
    try {
      // Clear biometric setting
      await AsyncStorage.removeItem(BIOMETRIC_KEY);

      // Clear PIN
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(PIN_KEY);
      } else {
        await SecureStore.deleteItemAsync(PIN_KEY);
      }
    } catch (error) {
      console.error("Error clearing security data:", error);
    }
  },
};
