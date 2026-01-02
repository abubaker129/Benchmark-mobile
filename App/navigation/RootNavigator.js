import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Splash from "../auth/splash";
import Login from "../auth/login";
import TabsNavigator from "../tabs/index";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={Splash}
        />

        {/* Authentication */}
        <Stack.Screen
          name="Login"
          component={Login}
        />

        {/* Main App (Bottom Tabs) */}
        <Stack.Screen
          name="AppTabs"
          component={TabsNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
