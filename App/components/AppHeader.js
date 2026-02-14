import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import Spacing from "../constants/spacing";

export default function AppHeader({ title, onMenuPress }) {
  return (
    <>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={onMenuPress} hitSlop={8}>
            <Ionicons name="menu" size={22} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <View style={styles.notification}>
            <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            <View style={styles.notificationDot} />
          </View>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#d8edf5",
    borderBottomWidth: 1,
    borderBottomColor: "#c8dde5",
    paddingHorizontal: Spacing.headerHorizontal,
    paddingVertical: Spacing.headerVertical,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLeft: { width: 32, alignItems: "flex-start" },
  headerCenter: { flex: 1, alignItems: "flex-start", paddingHorizontal: Spacing.md },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.text },
  headerRight: {
    width: 96,
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notification: { position: "relative", marginHorizontal: Spacing.sm },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#6ec3e6",
  },
});
