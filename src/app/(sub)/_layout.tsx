import { Stack } from "expo-router";

export default function SubLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet-detail" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="manage-templates" />
      <Stack.Screen name="debts" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="recurring" />
    </Stack>
  );
}
