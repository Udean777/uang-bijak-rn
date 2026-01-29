import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { AppText } from "../atoms/AppText";

interface PinPadProps {
  onVerify: (pin: string) => void;
  pinLength?: number;
  title?: string;
  subtitle?: string;
  isSettingUp?: boolean;
  onBiometricPress?: () => void;
  showBiometricButton?: boolean;
}

const { width } = Dimensions.get("window");
const KEY_SIZE = width / 5;

export function PinPad({
  onVerify,
  pinLength = 6,
  title = "Masukkan PIN",
  subtitle = "Demi keamanan data keuangan Anda",
  isSettingUp = false,
  onBiometricPress,
  showBiometricButton = false,
}: PinPadProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError("");

    if (key === "backspace") {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    if (pin.length < pinLength) {
      setPin((prev) => prev + key);
    }
  };

  useEffect(() => {
    if (pin.length === pinLength) {
      const timeout = setTimeout(() => {
        processPin();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [pin]);

  const processPin = () => {
    if (isSettingUp) {
      if (!isConfirming) {
        setConfirmPin(pin);
        setPin("");
        setIsConfirming(true);
      } else {
        if (pin === confirmPin) {
          onVerify(pin);
        } else {
          setError("PIN tidak cocok. Ulangi lagi.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setPin("");
          setConfirmPin("");
          setIsConfirming(false);
        }
      }
    } else {
      onVerify(pin);
    }
  };

  const keys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "",
    "0",
    "backspace",
  ];

  const displayTitle = isConfirming ? "Konfirmasi PIN" : title;
  const displaySubtitle = error
    ? error
    : isConfirming
      ? "Masukkan ulang PIN Anda"
      : subtitle;

  return (
    <View className="flex-1 justify-center items-center">
      <View className="items-center mb-10">
        <AppText variant="h2" weight="bold" className="mb-2">
          {displayTitle}
        </AppText>
        <AppText
          variant="body"
          className="text-center"
          style={{ color: error ? theme.danger : theme.text }}
        >
          {displaySubtitle}
        </AppText>
      </View>

      <View className="flex-row gap-4 mb-12 h-4">
        {Array.from({ length: pinLength }).map((_, i) => (
          <View
            key={i}
            className="w-4 h-4 rounded-full border"
            style={{
              borderColor: theme.text,
              backgroundColor: i < pin.length ? theme.text : "transparent",
            }}
          />
        ))}
      </View>

      <View className="flex-row flex-wrap justify-center w-full max-w-[350px]">
        {keys.map((k, i) => {
          if (k === "") {
            if (showBiometricButton && onBiometricPress && !isSettingUp) {
              return (
                <TouchableOpacity
                  key="bio-button"
                  className="items-center justify-center m-3"
                  style={{ width: KEY_SIZE, height: KEY_SIZE }}
                  onPress={onBiometricPress}
                >
                  <Ionicons
                    name="finger-print"
                    size={32}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              );
            }
            return (
              <View
                key={`spacer-${i}`}
                style={{ width: KEY_SIZE, height: KEY_SIZE, margin: 12 }}
              />
            );
          }

          return (
            <TouchableOpacity
              key={`key-${k}`}
              onPress={() => handlePress(k)}
              className="items-center justify-center rounded-full m-3"
              style={{
                width: KEY_SIZE,
                height: KEY_SIZE,
                backgroundColor: theme.card,
              }}
            >
              {k === "backspace" ? (
                <Ionicons
                  name="backspace-outline"
                  size={24}
                  color={theme.text}
                />
              ) : (
                <AppText variant="h2" weight="medium">
                  {k}
                </AppText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
