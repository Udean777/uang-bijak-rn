import { Stack } from "expo-router";

export default function SubLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet-detail" />
      <Stack.Screen name="wishlist" />
    </Stack>
  );
}
