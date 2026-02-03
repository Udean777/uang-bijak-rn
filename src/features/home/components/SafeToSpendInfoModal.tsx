import { AppText } from "@/src/components/atoms/AppText";
import { useTheme } from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { STATUS_MESSAGES } from "../constants/safeToSpend";
import {
  InfoModalType,
  useSafeToSpendStore,
} from "../store/useSafeToSpendStore";

interface InfoModalProps {
  walletName: string;
  status: "safe" | "warning" | "danger";
}

const getModalContent = (
  type: InfoModalType,
  walletName: string,
  status: "safe" | "warning" | "danger",
) => {
  switch (type) {
    case "safeToSpend":
      return {
        title: "Apa itu Safe-to-Spend?",
        description: `Ini adalah batas maksimal uang yang boleh kamu habiskan hari ini dari ${walletName} agar uangmu cukup sampai akhir bulan.`,
        formula: "(Saldo Kantong - Tagihan) ÷ Sisa Hari",
      };
    case "balance":
      return {
        title: `Saldo ${walletName}`,
        description: `Total uang di ${walletName} yang bisa kamu gunakan saat ini.`,
        formula: null,
      };
    case "status":
      return {
        title: "Status Keuangan",
        description: STATUS_MESSAGES[status],
        formula: null,
      };
    default:
      return null;
  }
};

export const SafeToSpendInfoModal = memo(
  ({ walletName, status }: InfoModalProps) => {
    const { colors, isDark } = useTheme();
    const { infoModal, closeInfoModal } = useSafeToSpendStore();

    const content = infoModal
      ? getModalContent(infoModal, walletName, status)
      : null;

    return (
      <Modal
        visible={!!infoModal}
        transparent
        animationType="fade"
        onRequestClose={closeInfoModal}
      >
        <TouchableWithoutFeedback onPress={closeInfoModal}>
          <View className="flex-1 bg-black/60 justify-center items-center p-6">
            <TouchableWithoutFeedback>
              <View
                className="p-6 rounded-3xl w-full max-w-sm"
                style={{ backgroundColor: colors.background }}
              >
                {content && (
                  <>
                    <View className="flex-row items-center gap-2 mb-3">
                      <Ionicons
                        name="sparkles"
                        size={24}
                        color={isDark ? colors.warning : "#F59E0B"}
                      />
                      <AppText variant="h3" weight="bold">
                        {content.title}
                      </AppText>
                    </View>

                    <AppText className="leading-6 mb-4">
                      {content.description}
                    </AppText>

                    {content.formula && (
                      <View
                        className="p-3 rounded-xl mb-4"
                        style={{
                          backgroundColor: isDark ? "#1E1E1E" : colors.surface,
                        }}
                      >
                        <AppText
                          variant="caption"
                          className="font-mono text-center"
                          style={{ color: isDark ? "white" : "black" }}
                        >
                          {content.formula}
                        </AppText>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={closeInfoModal}
                      className="py-3 rounded-xl items-center"
                      style={{
                        backgroundColor: isDark ? "#1E1E1E" : colors.primary,
                      }}
                    >
                      <AppText color="white" weight="bold">
                        Saya Mengerti
                      </AppText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

SafeToSpendInfoModal.displayName = "SafeToSpendInfoModal";
