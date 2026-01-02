import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import amendments from "./amendments";
import PlaceAmendment from "./PlaceAmendment";
import Colors from "../../constants/colors";

const Stack = createNativeStackNavigator();

export default function AmendmentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="amendments"
        component={amendments}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PlaceAmendment"
        component={PlaceAmendment}
        options={{
          title: "Place Amendment",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}
