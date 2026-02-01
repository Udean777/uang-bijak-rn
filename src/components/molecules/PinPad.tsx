import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "../atoms/AppText";
import { PIN_KEY_SIZE, PIN_KEYS } from "./config/variants";

interface PinPadProps {
  onVerify: (pin: string) => void;
  pinLength?: number;
  title?: string;
  subtitle?: string;
  isSettingUp?: boolean;
  onBiometricPress?: () => void;
  showBiometricButton?: boolean;
  error?: string; // Add explicit error prop support if needed by parent
}

export function PinPad({
  onVerify,
  pinLength = 6,
  title = "Masukkan PIN",
  subtitle = "Demi keamanan data keuangan Anda",
  isSettingUp = false,
  onBiometricPress,
  showBiometricButton = false,
  error: externalError,
}: PinPadProps) {
  const { colors } = useTheme();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [internalError, setInternalError] = useState("");

  const error = externalError || internalError;

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInternalError("");

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
          setInternalError("PIN tidak cocok. Ulangi lagi.");
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
          style={{ color: error ? colors.danger : colors.text }}
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
              borderColor: colors.text,
              backgroundColor: i < pin.length ? colors.text : "transparent",
            }}
          />
        ))}
      </View>

      <View className="flex-row flex-wrap justify-center w-full max-w-[350px]">
        {PIN_KEYS.map((k, i) => {
          if (k === "") {
            if (showBiometricButton && onBiometricPress && !isSettingUp) {
              return (
                <TouchableOpacity
                  key="bio-button"
                  className="items-center justify-center m-3"
                  style={{ width: PIN_KEY_SIZE, height: PIN_KEY_SIZE }}
                  onPress={onBiometricPress}
                >
                  <Ionicons
                    name="finger-print"
                    size={32}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              );
            }
            return (
              <View
                key={`spacer-${i}`}
                style={{
                  width: PIN_KEY_SIZE,
                  height: PIN_KEY_SIZE,
                  margin: 12,
                }}
              />
            );
          }

          return (
            <TouchableOpacity
              key={`key-${k}`}
              onPress={() => handlePress(k)}
              className="items-center justify-center rounded-full m-3"
              style={{
                width: PIN_KEY_SIZE,
                height: PIN_KEY_SIZE,
                backgroundColor: colors.card,
              }}
            >
              {k === "backspace" ? (
                <Ionicons
                  name="backspace-outline"
                  size={24}
                  color={colors.text}
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
