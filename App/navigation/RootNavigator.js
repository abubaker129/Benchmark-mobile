import React from "react";
import {
  NavigationContainer,
  DrawerActions,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import Splash from "../auth/splash";
import Login from "../auth/login";
import ForgetPass from "../auth/ForgetPass"; // 👈 ADD
import AppDrawer from "./AppDrawer";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const hasPeeked = React.useRef(false);
  const [navReady, setNavReady] = React.useState(false);

  React.useEffect(() => {
    if (!navReady || loading || !isAuthenticated || hasPeeked.current) return;
    hasPeeked.current = true;

    const openTimer = setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(DrawerActions.openDrawer());
      }
    }, 350);

    const closeTimer = setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(DrawerActions.closeDrawer());
      }
    }, 950);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [navReady, loading, isAuthenticated]);

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setNavReady(true)}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/* WAIT FOR AUTH HYDRATION */}
        {loading && (
          <Stack.Screen name="Splash" component={Splash} />
        )}

        {/* AUTH STACK */}
        {!loading && !isAuthenticated && (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ForgetPass" component={ForgetPass} />
          </>
        )}

        {/* APP STACK */}
        {!loading && isAuthenticated && (
          <Stack.Screen name="AppDrawer" component={AppDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
