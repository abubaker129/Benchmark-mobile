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
          backgroundColor: Colors.background,
          borderTopRightRadius: 22,
          borderBottomRightRadius: 22,
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
  drawerContainer: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    paddingTop: 0,
    paddingBottom: 14,
  },

  drawerContent: {
    paddingTop: 14,
    paddingHorizontal: 12,
  },

  topHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 18,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.16)",
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },

  avatarAccent: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#6ec3e6",
    borderWidth: 2,
    borderColor: Colors.primary,
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

  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 6,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },

  sectionCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceElevated,
  },

  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  itemRowPressed: {
    backgroundColor: "#e4f1f7",
  },

  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },

  itemIconDangerBg: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },

  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },

  itemLabelDanger: {
    color: "#b91c1c",
  },

  bottomArea: {
    marginTop: "auto",
    paddingHorizontal: 12,
    paddingTop: 14,
  },

  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.text,
  },
});
