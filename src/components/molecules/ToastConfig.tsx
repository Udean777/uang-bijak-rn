import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { AppText } from "../atoms/AppText";

const ToastLayout = ({ type, text1, text2 }: any) => {
  const styles = {
    success: {
      bg: "bg-green-100",
      border: "border-green-500",
      icon: "checkmark-circle",
      color: "text-green-700",
    },
    error: {
      bg: "bg-red-100",
      border: "border-red-500",
      icon: "alert-circle",
      color: "text-red-700",
    },
    info: {
      bg: "bg-blue-100",
      border: "border-blue-500",
      icon: "information-circle",
      color: "text-blue-700",
    },
  };

  const style = styles[type as keyof typeof styles] || styles.info;

  return (
    <View
      className={`w-[90%] flex-row items-center p-4 rounded-2xl border-l-4 shadow-sm bg-white ${style.border}`}
    >
      <Ionicons
        name={style.icon as any}
        size={28}
        className={style.color}
        color={
          type === "error"
            ? "#EF4444"
            : type === "success"
              ? "#10B981"
              : "#3B82F6"
        }
      />
      <View className="ml-3 flex-1">
        <AppText weight="bold" className="text-gray-900">
          {text1}
        </AppText>
        {text2 && (
          <AppText variant="caption" className="text-gray-600 mt-1">
            {text2}
          </AppText>
        )}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props: BaseToastProps) => <ToastLayout type="success" {...props} />,
  error: (props: BaseToastProps) => <ToastLayout type="error" {...props} />,
  info: (props: BaseToastProps) => <ToastLayout type="info" {...props} />,
};
