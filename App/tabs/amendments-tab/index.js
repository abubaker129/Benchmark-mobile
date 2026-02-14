import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Amendments from "./amendments";
import PlaceAmendment from "./PlaceAmendment";

const Stack = createNativeStackNavigator();

export default function AmendmentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="amendments"
        component={Amendments}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PlaceAmendment"
        component={PlaceAmendment}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
