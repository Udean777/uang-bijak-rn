import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add-transaction"
        options={{
          presentation: "modal",
          headerTitle: "Tambah Transaksi",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-wallet"
        options={{
          presentation: "modal",
          headerTitle: "Tambah Dompet",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-subscription"
        options={{
          presentation: "modal",
          headerTitle: "Tambah Subs",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
