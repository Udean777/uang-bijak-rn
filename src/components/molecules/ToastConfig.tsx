import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { AppText } from "../atoms/AppText";
import { ToastType, getToastStyles } from "./config/variants";

const ToastLayout = ({
  type,
  text1,
  text2,
}: BaseToastProps & { type: ToastType }) => {
  const { isDark } = useTheme();

  const styles = useMemo(() => getToastStyles(type, isDark), [type, isDark]);

  return (
    <View
      className={`w-[90%] flex-row items-center p-4 rounded-2xl border-l-4 shadow-sm ${styles.bg} ${styles.border}`}
    >
      <Ionicons
        name={styles.icon as any}
        size={28}
        className={styles.color}
        color={styles.iconColor}
      />
      <View className="ml-3 flex-1">
        <AppText weight="bold" className={styles.color}>
          {text1}
        </AppText>
        {text2 && (
          <AppText
            variant="caption"
            className={`${styles.color} mt-1 opacity-90`}
          >
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
