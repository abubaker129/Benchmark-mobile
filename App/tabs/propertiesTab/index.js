import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PropertiesHome from "./PropertiesHome";
import AddProperty from "./AddProperty";
import PropertyServices from "./PropertyServices";
import UploadMedia from "./UploadMedia";
import Instructions from "./Instructions";
import PropertyReview from "./PropertyReview";
import Colors from "../../constants/colors";

const Stack = createNativeStackNavigator();

export default function PropertiesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PropertiesHome"
        component={PropertiesHome}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AddProperty"
        component={AddProperty}
        options={{
          title: "Add Property",
          headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen
        name="PropertyServices"
        component={PropertyServices}
        options={{
          title: "Select Services",
          headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen
        name="UploadMedia"
        component={UploadMedia}
        options={{
          title: "Upload Media",
          headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen
        name="Instructions"
        component={Instructions}
        options={{
          title: "Instructions",
          headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen
        name="PropertyReview"
        component={PropertyReview}
        options={{
          title: "Review Property",
          headerShown: false,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}
