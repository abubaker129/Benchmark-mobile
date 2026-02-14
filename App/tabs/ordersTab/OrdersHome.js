import React, { useState, useCallback, useMemo } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../../constants/colors";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../context/AuthContext";
import AppHeader from "../../components/AppHeader";
import Spacing from "../../constants/spacing";

const COLORS = {
  PRIMARY: Colors.primary,
  BG: Colors.background,
  CARD_BG: Colors.surfaceElevated || Colors.cardBg,
  TEXT_PRIMARY: Colors.text,
  TEXT_SECONDARY: Colors.textSecondary,
  BORDER: Colors.surfaceBorder || Colors.border,
  SHADOW: Colors.shadow || "#7fa2b4",
};

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Completed", value: "completed" },
];

const TIME_OPTIONS = ["All Time", "Last 7 days", "Last 30 days", "This Year"];

const normalizeStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (["active", "in_process", "in process", "pending"].includes(s)) return "active";
  if (["pending_review", "pending review", "pending_check", "checking"].includes(s)) return "pending_review";
  if (s === "completed") return "completed";
  return "other";
};

const toTitleStatus = (status) => {
  const s = normalizeStatus(status);
  if (s === "active") return "In Process";
  if (s === "pending_review") return "Pending Review";
  if (s === "completed") return "Completed";
  return "N/A";
};

const formatDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString();
};

const getStatusPill = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed") return { text: "#0F766E", bg: "#CCFBF1" };
  if (normalized === "pending_review") return { text: "#92400E", bg: "#FEF3C7" };
  if (normalized === "active") return { text: "#1D4ED8", bg: "#DBEAFE" };
  return { text: "#374151", bg: "#E5E7EB" };
};

const mapOrderFromSupabase = (row) => {
  const propertyLabel =
    row?.property?.name || [row?.property?.street, row?.property?.city].filter(Boolean).join(", ") || "Unknown property";

  return {
    id: row?.id ?? null,
    orderNumber: row?.order_number ?? "N/A",
    propertyLabel,
    orderType: row?.order_type ?? "N/A",
    code: row?.order_number ?? "N/A",
    status: row?.status ?? "",
    statusLabel: toTitleStatus(row?.status),
    addressOrderId: `${propertyLabel} - ${row?.order_number || "N/A"}`,
    createdAt: row?.created_at ?? null,
    completedAt: row?.completed_at ?? null,
  };
};

export default function OrdersHome({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTime, setFilterTime] = useState("All Time");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

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

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          order_type,
          status,
          created_at,
          completed_at,
          property:properties(id, name, street, city, zip, property_type)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(mapOrderFromSupabase));
    } catch (error) {
      setOrders([]);
      Alert.alert("Failed to load orders", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      const parent = getDrawerParent();
      parent?.closeDrawer?.();
      loadOrders();
    }, [getDrawerParent, loadOrders])
  );

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch = filterStatus === "all" || normalizeStatus(order.status) === filterStatus;
      if (!statusMatch) return false;

      if (filterTime !== "All Time") {
        const now = new Date();
        let start = null;

        if (filterTime === "Last 7 days") {
          start = new Date(now);
          start.setDate(now.getDate() - 6);
        } else if (filterTime === "Last 30 days") {
          start = new Date(now);
          start.setDate(now.getDate() - 29);
        } else if (filterTime === "This Year") {
          start = new Date(now.getFullYear(), 0, 1);
        }

        if (start) {
          if (!order.createdAt) return false;
          const created = new Date(order.createdAt);
          if (created < start || created > now) return false;
        }
      }

      if (!q) return true;
      return (
        String(order.addressOrderId || "").toLowerCase().includes(q) ||
        String(order.code || "").toLowerCase().includes(q) ||
        String(order.orderType || "").toLowerCase().includes(q)
      );
    });
  }, [orders, filterStatus, filterTime, search]);

  const activeCount = useMemo(() => filteredOrders.filter((o) => normalizeStatus(o.status) === "active").length, [filteredOrders]);
  const pendingCount = useMemo(
    () => filteredOrders.filter((o) => normalizeStatus(o.status) === "pending_review").length,
    [filteredOrders]
  );
  const completedCount = useMemo(
    () => filteredOrders.filter((o) => normalizeStatus(o.status) === "completed").length,
    [filteredOrders]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Orders" onMenuPress={openDrawer} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.statsGrid}>
                <StatCard icon="document-outline" iconColor="#2B9CCC" title="Active Orders" value={String(activeCount)} />
                <StatCard icon="time-outline" iconColor="#F59E0B" title="Pending Review" value={String(pendingCount)} />
                <StatCard
                  icon="checkmark-done-outline"
                  iconColor="#10B981"
                  title="Completed"
                  value={String(completedCount)}
                  iconNudge={-1}
                />
              </View>

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <TextInput
                  placeholder="Search by order ID, property, or type..."
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterPill}
                  onPress={() => {
                    setShowStatusDropdown((prev) => !prev);
                    setShowTimeDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="funnel-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.filterText}>
                    {STATUS_OPTIONS.find((statusOption) => statusOption.value === filterStatus)?.label || "All Status"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filterPill}
                  onPress={() => {
                    setShowTimeDropdown((prev) => !prev);
                    setShowStatusDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.filterText}>{filterTime}</Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>

              {showStatusDropdown && (
                <View style={styles.dropdown}>
                  {STATUS_OPTIONS.map((statusOption) => (
                    <TouchableOpacity
                      key={statusOption.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFilterStatus(statusOption.value);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Ionicons
                        name={filterStatus === statusOption.value ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={filterStatus === statusOption.value ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                      />
                      <Text style={[styles.dropdownText, filterStatus === statusOption.value && { fontWeight: "800" }]}>
                        {statusOption.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {showTimeDropdown && (
                <View style={styles.dropdown}>
                  {TIME_OPTIONS.map((timeOption) => (
                    <TouchableOpacity
                      key={timeOption}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFilterTime(timeOption);
                        setShowTimeDropdown(false);
                      }}
                    >
                      <Ionicons
                        name={filterTime === timeOption ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={filterTime === timeOption ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                      />
                      <Text style={[styles.dropdownText, filterTime === timeOption && { fontWeight: "800" }]}>
                        {timeOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPlaceAmend={() => navigation.navigate("PlaceAmendment", { orderId: item?.id })}
            />
          )}
          ListEmptyComponent={!loading ? <EmptyState /> : null}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatCard({ icon, iconColor, title, value, description, iconNudge = 0 }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
          style={iconNudge ? { transform: [{ translateY: iconNudge }] } : undefined}
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
      {description && <Text style={styles.statDescription}>{description}</Text>}
    </View>
  );
}

function OrderCard({ order, onPlaceAmend }) {
  const pill = getStatusPill(order?.status);
  const isCompleted = normalizeStatus(order?.status) === "completed";

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.orderCode}>{order?.orderNumber || "N/A"}</Text>
          <Text style={styles.propertyText} numberOfLines={1}>
            {order?.propertyLabel || "Unknown property"}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.statusPillText, { color: pill.text }]}>{order?.statusLabel || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Order Type" value={order?.orderType || "N/A"} />
        <MetaItem label="Code" value={order?.code || "N/A"} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>Created {formatDate(order?.createdAt)}</Text>
        {isCompleted ? (
          <TouchableOpacity style={styles.amendPill} onPress={onPlaceAmend} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={13} color={COLORS.PRIMARY} />
            <Text style={styles.amendPillText}>Place an Amend</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.cardMeta}>Completed {formatDate(order?.completedAt)}</Text>
        )}
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

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="document-outline" size={40} color={COLORS.PRIMARY} />
      </View>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptySub}>Try changing filters or place a new order.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BG },
  listContent: { padding: Spacing.screenPadding, paddingBottom: 32 },

  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: COLORS.SHADOW, shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 7 } },
      android: { elevation: 2 },
    }),
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 28, fontWeight: "900", color: COLORS.TEXT_PRIMARY, marginBottom: 6, textAlign: "center" },
  statLabel: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: "700", textAlign: "center" },
  statDescription: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: "500", marginTop: 3, textAlign: "center" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
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

  filterRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  filterPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterText: { fontSize: 14, color: COLORS.TEXT_PRIMARY, fontWeight: "700", flex: 1, textAlign: "center" },

  dropdown: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: COLORS.SHADOW, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
      android: { elevation: 2 },
    }),
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 10,
  },
  dropdownText: { fontSize: 14, color: COLORS.TEXT_PRIMARY, fontWeight: "600" },

  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: `${COLORS.PRIMARY}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...Platform.select({
      ios: { shadowColor: COLORS.SHADOW, shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 1 },
    }),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderCode: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
  },
  propertyText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontWeight: "700",
    fontSize: 12,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
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
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  amendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: `${COLORS.PRIMARY}44`,
    backgroundColor: `${COLORS.PRIMARY}12`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  amendPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.PRIMARY,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});
