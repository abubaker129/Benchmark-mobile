import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { searchOrders } from "../../api/orders.api";
import { mapOrderFromApi } from "../../utils/orderMapper";

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

export default function OrdersHome({ navigation }) {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const debounceTimer = useRef(null);

  /* ===================== 300ms DEBOUNCE ===================== */
  const handleSearchChange = (text) => {
    setSearch(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearchLoading(true);

      searchOrders(text)
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          const mapped = list.map(mapOrderFromApi);
          setOrders(mapped);
        })
        .catch(() => setOrders([]))
        .finally(() => setSearchLoading(false));
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* HEADER */}
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
          data={orders}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : String(index)
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* NAV BUTTONS */}
              <PrimaryNavButton
                icon="add-circle-outline"
                title="Place a New Order"
                subtitle="Create a new order request"
                onPress={() => navigation.navigate("PlaceOrder")}
                activeOpacity={0.85}
              />

              <PrimaryNavButton
                icon="time-outline"
                title="In Process Orders"
                subtitle="Orders currently being worked on"
                onPress={() => navigation.navigate("InProcessOrders")}
                activeOpacity={0.85}
              />

              <PrimaryNavButton
                icon="alert-circle-outline"
                title="Pending Orders"
                subtitle="Orders awaiting approval or action"
                onPress={() => navigation.navigate("PendingOrders")}
                activeOpacity={0.85}
              />
              <PrimaryNavButton
                icon="checkmark-done-outline"
                title="Completed Orders"
                subtitle="All the completed orders"
                onPress={() => navigation.navigate("CompletedOrders")}
                activeOpacity={0.85}
              />
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
                  value={search}
                  onChangeText={handleSearchChange}
                />
                {searchLoading && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.TEXT_SECONDARY}
                  />
                )}
              </View>
              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Orders</Text>
                <View style={styles.countPill}>
                  <Text style={styles.countText}>{orders.length}</Text>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            !searchLoading && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search-outline"
                  size={40}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptySub}>
                  Search by address or Order ID to see results.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => <CompletedOrderCard order={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===================== COMPONENTS ===================== */

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

/* ===================== CARD (N/A SAFE) ===================== */

function CompletedOrderCard({ order }) {
  const safe = (v) => (v === undefined || v === null || v === "" ? "N/A" : v);

  return (
    <View style={styles.orderCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderAddress} numberOfLines={2}>
          {safe(order?.addressOrderId)}
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {safe(order?.status || "Completed")}
          </Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Order Type" value={safe(order?.orderType)} />
        <MetaItem label="Code" value={safe(order?.code)} />
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Preference" value={safe(order?.preference)} />
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Order Time" value={safe(order?.orderTime)} />
        <MetaItem label="Done Time" value={safe(order?.doneTime)} />
      </View>

      <View style={styles.metaGrid}>
        <MetaLink label="Original Link" value={safe(order?.originalLink)} />
        <MetaLink
          label="Final Files Link"
          value={safe(order?.finalFilesLink)}
        />
      </View>

      <View style={styles.filesRow}>
        <FileButton
          label="Request Amendment"
          icon="create-outline"
          available={!!order?.originalFilesAvailable}
          onPress={() => {}}
        />
        <FileButton
          label="Download Files"
          icon="download-outline"
          available={!!order?.finalFilesAvailable}
          onPress={() => {}}
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
  const isNA = value === "N/A";
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

function FileButton({ label, available, onPress, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fileBtn, !available && styles.fileBtnDisabled]}
      disabled={!available}
    >
      <Ionicons
        name={icon}
        size={14}
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

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BG },

  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
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

  listContent: { padding: 16, paddingBottom: 32 },

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
  searchInput: { flex: 1, fontSize: 14, color: COLORS.TEXT_PRIMARY },

  emptyState: {
    alignItems: "center",
    marginTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },

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
  },
  primaryButtonSub: { fontSize: 12, color: "#E5E7EB" },

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
  },
  countPill: {
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { fontWeight: "700" },

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
  fileBtnDisabled: { backgroundColor: "#E5E7EB" },
  fileBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
