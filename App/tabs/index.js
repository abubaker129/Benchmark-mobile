import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Dashboard from "./dashboard";
import OrdersStack from "./ordersTab";
import AmendmentsStack from "./amendments-tab/amendments";
import Colors from "../constants/colors";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color }) => {
          let icon;

          if (route.name === "Dashboard") {
            icon = focused ? "home" : "home-outline";
          } else if (route.name === "Orders") {
            icon = focused ? "cube" : "cube-outline";
          } else if (route.name === "Amendments") {
            icon = focused
              ? "document-text"
              : "document-text-outline";
          }

          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Amendments" component={AmendmentsStack} />
    </Tab.Navigator>
  );
}
