import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersHomeScreen from "./OrdersHome";
import PlaceOrder from "./PlaceOrder";
import Colors from "../../constants/colors";

const Stack = createNativeStackNavigator();

export default function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrdersHome"
        component={OrdersHomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PlaceOrder"
        component={PlaceOrder}
        options={{
          title: "Place New Order",
           headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}
