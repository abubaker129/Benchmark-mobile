import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import Splash from "../auth/splash";
import Login from "../auth/login";
import TabsNavigator from "../tabs/index";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
console.log("ROOT NAV:", { loading, isAuthenticated });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/*  WAIT FOR AUTH HYDRATION */}
        {loading && (
          <Stack.Screen name="Splash" component={Splash} />
        )}

        {/*  AUTH STACK */}
        {!loading && !isAuthenticated && (
          <Stack.Screen name="Login" component={Login} />
        )}

        {/*  APP STACK */}
        {!loading && isAuthenticated && (
          <Stack.Screen name="AppTabs" component={TabsNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
