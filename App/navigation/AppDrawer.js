import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import TabsNavigator from "../tabs";
import UserManagement from "../tabs/userManagement";
import Billing from "../tabs/billing";
import Settings from "../tabs/settings";
import Colors from "../constants/colors";
import { useAuth } from "../context/AuthContext";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          width: 300,
          backgroundColor: "#F3F6FB",
          // borderTopRightRadius: 28,
           borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          overflow: "hidden",
        },
        overlayColor: "rgba(15,23,42,0.35)",
        sceneContainerStyle: { backgroundColor: Colors.background },
        swipeEnabled: true,
        swipeEdgeWidth: 80,
      }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="AppTabs" component={TabsNavigator} />
      <Drawer.Screen name="UserManagement" component={UserManagement} />
      <Drawer.Screen name="Billing" component={Billing} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}

function AppDrawerContent({ navigation }) {
  const { logout } = useAuth();

  const onSignOut = async () => {
    await logout();
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      contentContainerStyle={styles.drawerContainer}
      showsVerticalScrollIndicator={false}
    >
   {/* TOP HEADER (reference-like) */}
<View style={styles.topHeader}>
  <Pressable
    onPress={() => {}}
    style={({ pressed }) => [styles.topHeaderRow, pressed && { opacity: 0.96 }]}
  >
    <View style={styles.avatarOuter}>
      {/* little accent wedge like the reference */}
      <View style={styles.avatarAccent} />
      <Ionicons name="person" size={18} color="#1F2937" />
    </View>

    <View style={styles.userInfo}>
      <Text style={styles.userName}>abubaker</Text>
      <Text style={styles.userSub}>Admin</Text>
    </View>

    {/* <Ionicons name="chevron-forward" size={20} color="#FFFFFF" /> */}
  </Pressable>
</View>

      {/* CONTENT */}
      <View style={styles.drawerContent}>
        <SectionTitle title="Management" />
        <View style={styles.sectionCard}>
          <DrawerItemRow
            icon="people-outline"
            label="User Management"
            onPress={() => {
              navigation.navigate("UserManagement");
              navigation.closeDrawer();
            }}
            isLast
          />
        </View>

        <SectionTitle title="Account" />
        <View style={styles.sectionCard}>
          <DrawerItemRow
            icon="card-outline"
            label="Billing"
            onPress={() => {
              navigation.navigate("Billing");
              navigation.closeDrawer();
            }}
          />
          <DrawerItemRow
            icon="settings-outline"
            label="Settings"
            onPress={() => {
              navigation.navigate("Settings");
              navigation.closeDrawer();
            }}
            isLast
          />
        </View>
      </View>

      {/* BOTTOM AREA */}
      <View style={styles.bottomArea}>
        <View style={styles.sectionCard}>
          <DrawerItemRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={onSignOut}
            danger
            isLast
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function DrawerItemRow({ icon, label, onPress, rightElement, isLast, danger }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(15,23,42,0.06)" }}
      style={({ pressed }) => [
        styles.itemRow,
        pressed && styles.itemRowPressed,
        !isLast && styles.itemRowDivider,
      ]}
    >
      <View style={[styles.itemIcon, danger && styles.itemIconDangerBg]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? "#DC2626" : "#64748B"}
        />
      </View>

      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>
        {label}
      </Text>

      {rightElement ? rightElement : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Whole drawer scroll container
  drawerContainer: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
    paddingBottom: 8,
  },

  drawerContent: {
    paddingTop: 10,
  },

  /* =========================
     HEADER (flat like reference)
     ========================= */
  topHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,

    // reference uses a simple separator, not shadow
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.16)",
  },

  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,

    // subtle outline, no fancy ring
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  userSub: {
    marginTop: 3,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "500",
  },

  /* =========================
     SECTION TITLES
     ========================= */
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  /* =========================
     FLAT LIST (no card)
     ========================= */
  sectionCard: {
    backgroundColor: "#FFFFFF",
    // no radius, no shadow, no border box
  },

  /* =========================
     ROWS (flat + dividers)
     ========================= */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },

  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  itemRowPressed: {
    backgroundColor: "#F3F4F6",
  },

  itemIcon: {
    width: 28,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    // IMPORTANT: no square background behind icon
    backgroundColor: "transparent",
  },

  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  /* =========================
     BOTTOM / LOGOUT (same as ref)
     ========================= */
  bottomArea: {
    marginTop: "auto",
  },

  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  logoutIcon: {
    width: 28,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827", // reference shows normal, not red highlight
  },
});
