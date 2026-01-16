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
    </Stack>
  );
}
