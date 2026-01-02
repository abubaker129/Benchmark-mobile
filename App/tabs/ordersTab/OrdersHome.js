import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

/* ===================== COLORS (LOCAL) ===================== */
const COLORS = {
  PRIMARY: "#0c4a6e",
  BG: "#ffffff",
  CARD_BG: "#f3f6fb",
  TEXT_PRIMARY: "#111827",
  TEXT_SECONDARY: "#6b7280",
  BORDER: "#e5e7eb",
  LINK: "#2563eb",
};

/* ===================== MOCK DATA (replace with API later) ===================== */
const COMPLETED_ORDERS = [
  {
    id: "1",
    addressOrderId: "Test Order 12 Nov 2025 AGAIN by SAJID",
    orderType: "2D FloorPlan",
    code: "NEW TEST",
    preference: "NEW TEST",
    orderTime: "2025-11-12 17:43:53",
    doneTime: "2025-11-12 17:50:36",
    originalLink: "N/A",
    finalFilesLink: "N/A",
    originalFilesAvailable: true,
    finalFilesAvailable: true,
  },
  {
    id: "2",
    addressOrderId: "Sajid Test Order 12 Nov 2025",
    orderType: "2D FloorPlan",
    code: "Test",
    preference: "Sajid Test Order 12 Nov 2025",
    orderTime: "2025-11-12 17:31:00",
    doneTime: "2025-11-12 17:40:08",
    originalLink: "N/A",
    finalFilesLink: "Completed Test Order Umar Iftikhar",
    originalFilesAvailable: true,
    finalFilesAvailable: true,
  },
  {
    id: "3",
    addressOrderId: "Test",
    orderType: "Photo Editing",
    code: "—",
    preference: "—",
    orderTime: "2025-06-11 13:16:52",
    doneTime: "2025-09-19 17:44:28",
    originalLink: "N/A",
    finalFilesLink: "1",
    originalFilesAvailable: true,
    finalFilesAvailable: true,
  },
];

export default function OrdersHome({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Same header style as dashboard */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>

        <View style={styles.notification}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>7</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={COMPLETED_ORDERS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={COLORS.TEXT_SECONDARY}
                />
                <TextInput
                  placeholder="Type address or Order ID to search..."
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  style={styles.searchInput}
                />
              </View>

              {/* BIG PRIMARY BUTTONS (one per line) */}
              <PrimaryNavButton
                icon="add-circle-outline"
                title="Place a New Order"
                subtitle="Create a new order request"
                onPress={() => navigation.navigate("PlaceOrder")}
              />

              <PrimaryNavButton
                icon="time-outline"
                title="In Process Orders"
                subtitle="Orders currently being worked on"
                onPress={() => console.log("In Process Orders")}
              />

              <PrimaryNavButton
                icon="alert-circle-outline"
                title="Pending Orders"
                subtitle="Orders awaiting approval or action"
                onPress={() => console.log("Pending Orders")}
              />

              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Completed Orders</Text>
                  <Text style={styles.sectionSub}>
                    These orders have been completed.
                  </Text>
                </View>

                <View style={styles.countPill}>
                  <Text style={styles.countText}>
                    {COMPLETED_ORDERS.length}
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => <CompletedOrderCard order={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* COMPONENTS */

function PrimaryNavButton({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.primaryButton}>
      <View style={styles.primaryButtonIcon}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.primaryButtonTitle}>{title}</Text>
        <Text style={styles.primaryButtonSub}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward-outline" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

function CompletedOrderCard({ order }) {
  return (
    <View style={styles.orderCard}>
      {/* Row 1 */}
      <View style={styles.rowBetween}>
        <Text style={styles.orderAddress} numberOfLines={2}>
          {order.addressOrderId}
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>

      {/* Grid rows (like table fields, mobile-friendly) */}
      <View style={styles.metaGrid}>
        <MetaItem label="Order Type" value={order.orderType} />
        <MetaItem label="Code" value={order.code} />
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Preference" value={order.preference} />
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Order Time" value={order.orderTime} />
        <MetaItem label="Done Time" value={order.doneTime} />
      </View>

      <View style={styles.metaGrid}>
        <MetaLink label="Original Link" value={order.originalLink} />
        <MetaLink label="Final Files Link" value={order.finalFilesLink} />
      </View>

      {/* Files actions */}
      <View style={styles.filesRow}>
        <FileButton
          label="Original Files"
          available={order.originalFilesAvailable}
          onPress={() => console.log("Original Files", order.id)}
        />
        <FileButton
          label="Final Files"
          available={order.finalFilesAvailable}
          onPress={() => console.log("Final Files", order.id)}
        />
      </View>
    </View>
  );
}

function MetaItem({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function MetaLink({ label, value }) {
  const isNA = !value || value === "N/A";
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text
        style={[styles.metaValue, !isNA && styles.linkText]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function FileButton({ label, available, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fileBtn, !available && styles.fileBtnDisabled]}
      disabled={!available}
    >
      <Ionicons
        name="eye-outline"
        size={18}
        color={available ? "#fff" : COLORS.TEXT_SECONDARY}
      />
      <Text
        style={[
          styles.fileBtnText,
          !available && { color: COLORS.TEXT_SECONDARY },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },

  /* DASHBOARD-LIKE HEADER */
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff33",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 92,
  },
  notification: { position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: { color: "#fff", fontSize: 10, fontWeight: "600" },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },

  /* BIG PRIMARY NAV BUTTONS */
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  primaryButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff22",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  primaryButtonSub: {
    fontSize: 12,
    color: "#E5E7EB",
  },

  /* SECTION HEADER */
  sectionHeader: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  countPill: {
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "700",
  },

  /* COMPLETED ORDER CARD */
  orderCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },

  orderAddress: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  statusPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "700",
  },

  metaGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },

  metaLabel: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 3,
  },

  metaValue: {
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },

  linkText: {
    color: COLORS.LINK,
    textDecorationLine: "underline",
  },

  filesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  fileBtn: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  fileBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },

  fileBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
