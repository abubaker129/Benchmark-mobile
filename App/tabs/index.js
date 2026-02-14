import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Statistics from "./statistics";
import OrdersStack from "./ordersTab";
import AmendmentsStack from "./amendments-tab";
import PropertiesStack from "./propertiesTab";
import Colors from "../constants/colors";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Statistics"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: Colors.background,
          borderTopColor: "#c8dde5",
        },
        tabBarIcon: ({ focused, color }) => {
          let icon;

          if (route.name === "Statistics") {
            icon = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Orders") {
            icon = focused ? "cube" : "cube-outline";
          } else if (route.name === "Properties") {
            icon = focused ? "home" : "home-outline";
          } else if (route.name === "Amendments") {
            icon = focused
              ? "document-text"
              : "document-text-outline";
          }

          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Statistics" component={Statistics} />
      <Tab.Screen name="Properties" component={PropertiesStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Amendments" component={AmendmentsStack} />
    </Tab.Navigator>
  );
}
