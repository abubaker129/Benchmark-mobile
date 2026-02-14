import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Colors from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import Spacing from "../../constants/spacing";

const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;

export default function PropertiesHome() {
  const navigation = useNavigation();
  const getDrawerParent = useCallback(() => {
    let parent = navigation.getParent?.();
    while (parent && !parent.openDrawer && parent.getParent) {
      parent = parent.getParent?.();
    }
    return parent;
  }, [navigation]);

  const openDrawer = () => {
    const parent = getDrawerParent();
    if (parent?.openDrawer) parent.openDrawer();
    else navigation.openDrawer?.();
  };

  useFocusEffect(
    useCallback(() => {
      const parent = getDrawerParent();
      parent?.closeDrawer?.();
    }, [getDrawerParent])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Properties" onMenuPress={openDrawer} />
      {/* EMPTY STATE */}
      <View style={styles.container}>
        <View style={styles.emptyStateIcon}>
          <Ionicons name="home" size={56} color="#fff" />
        </View>
        <Text style={styles.emptyTitle}>No properties found</Text>
        <Text style={styles.emptySub}>
          Get started by adding your first property
        </Text>

        {/* ADD PROPERTY BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddProperty")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Property</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.screenPadding,
  },

  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },

  emptySub: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 32,
  },

  addBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
