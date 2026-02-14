import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";

const PRIMARY = Colors.primary;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;

const STEPS = [
  { key: "info", label: "Property Info", icon: "business-outline" },
  { key: "services", label: "Services", icon: "layers-outline" },
  { key: "upload", label: "Upload Media", icon: "cloud-upload-outline" },
  { key: "instructions", label: "Instructions", icon: "chatbox-ellipses-outline" },
  { key: "review", label: "Review", icon: "document-text-outline" },
];

export default function StepProgress({ current = 1, iconsOnly = false }) {
  return (
    <View style={styles.container}>
      {STEPS.map((s, i) => {
        const stepIndex = i + 1;
        const completed = stepIndex < current;
        const active = stepIndex === current;

        return (
          <View key={s.key} style={styles.stepWrap}>
            <View
              style={[
                styles.circle,
                completed && styles.circleCompleted,
                active && styles.circleActive,
              ]}
            >
              <Ionicons
                name={completed ? "checkmark" : s.icon}
                size={18}
                color={completed || active ? "#fff" : TEXT_SECONDARY}
              />
            </View>

            {!iconsOnly && (
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {s.label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  stepWrap: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eef2f5",
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: PRIMARY,
  },
  circleCompleted: {
    backgroundColor: "#10b981",
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: TEXT_SECONDARY,
    maxWidth: 80,
    textAlign: "center",
  },
  labelActive: {
    color: TEXT_PRIMARY,
    fontWeight: "700",
  },
  connector: {
    position: "absolute",
    top: 22,
    left: "100%",
    height: 2,
    width: 22,
    backgroundColor: "#e6edf1",
  },
});
