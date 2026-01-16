import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const activeColor = Colors[colorScheme ?? "light"].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            elevation: 0,
            shadowColor: "transparent",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add_placeholder"
        options={{
          title: "",
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <View className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center -mt-6 shadow-lg shadow-blue-300">
              <Ionicons name="add" size={32} color="white" />
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push("/(modals)/add-transaction");
          },
        })}
      />

      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analisa",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
