import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersHomeScreen from "./OrdersHome";
import PlaceOrder from "./PlaceOrder";
import InProcessOrders from "./InProcessOrders";
import Colors from "../../constants/colors";
import PendingOrders from "./PendingOrders";
import CompletedOrders from "./CompletedOrders";

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
        name="InProcessOrders"
        component={InProcessOrders}
        options={{
          title: "In Process Orders",
          headerShown: false,
        }}
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

       <Stack.Screen
        name="PendingOrders"
        component={PendingOrders}
        options={{
          title: "Pending Orders",
          headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
  name="CompletedOrders"
  component={CompletedOrders}
  options={{ headerShown: false }}
/>
    </Stack.Navigator>
  );
}
