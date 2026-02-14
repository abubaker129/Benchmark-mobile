import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../../constants/colors";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../context/AuthContext";
import AppHeader from "../../components/AppHeader";
import Spacing from "../../constants/spacing";

/* ===================== COLORS (FROM GLOBAL) ===================== */
const COLORS = {
  PRIMARY: Colors.primary,
  BG: Colors.background,
  CARD_BG: Colors.cardBg,
  TEXT_PRIMARY: Colors.text,
  TEXT_SECONDARY: Colors.textSecondary,
  BORDER: Colors.border,
  LINK: "#2563eb",
};

const normalizeStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "active" || s === "in_process" || s === "in process") return "active";
  if (s === "pending_review" || s === "pending review") return "pending_review";
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

const formatDateTime = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
};

const mapOrderFromSupabase = (row) => {
  const propertyLabel = row?.property?.name || [row?.property?.street, row?.property?.city].filter(Boolean).join(", ") || "Property";
  return {
    id: row?.id ?? null,
    addressOrderId: `${propertyLabel} - ${row?.order_number || "N/A"}`,
    orderType: row?.order_type ?? "N/A",
    code: row?.order_number ?? "N/A",
    status: toTitleStatus(row?.status),
    preference: row?.notes ?? "N/A",
    orderTime: formatDateTime(row?.created_at),
    doneTime: formatDateTime(row?.completed_at),
    originalLink: "N/A",
    finalFilesLink: "N/A",
    originalFilesAvailable: false,
    finalFilesAvailable: false,
    createdAt: row?.created_at ?? null,
  };
};

export default function OrdersHome({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All Status");
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

  useFocusEffect(
    useCallback(() => {
      const parent = getDrawerParent();
      parent?.closeDrawer?.();
    }, [getDrawerParent])
  );

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          property:properties(id, name, street, city, zip, property_type)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(mapOrderFromSupabase));
    } catch (e) {
      setOrders([]);
    } finally {
      setSearchLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const handleSearchChange = (text) => {
    setSearch(text);
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (filterStatus === "Active") {
      list = list.filter((o) => normalizeStatus(o.status) === "active");
    } else if (filterStatus === "Pending Review") {
      list = list.filter((o) => normalizeStatus(o.status) === "pending_review");
    } else if (filterStatus === "Completed") {
      list = list.filter((o) => normalizeStatus(o.status) === "completed");
    }

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
        list = list.filter((o) => {
          if (!o.createdAt) return false;
          const created = new Date(o.createdAt);
          return created >= start && created <= now;
        });
      }
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => {
      return (
        String(o.addressOrderId || "").toLowerCase().includes(q) ||
        String(o.code || "").toLowerCase().includes(q) ||
        String(o.orderType || "").toLowerCase().includes(q)
      );
    });
  }, [orders, filterStatus, filterTime, search]);

  const activeCount = useMemo(() => filteredOrders.filter((o) => normalizeStatus(o.status) === "active").length, [filteredOrders]);
  const pendingCount = useMemo(() => filteredOrders.filter((o) => normalizeStatus(o.status) === "pending_review").length, [filteredOrders]);
  const completedCount = useMemo(() => filteredOrders.filter((o) => normalizeStatus(o.status) === "completed").length, [filteredOrders]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Orders" onMenuPress={openDrawer} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : String(index)
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* STAT CARDS */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="document-outline"
                  iconColor="#2B9CCC"
                  title="Active Orders"
                  value={String(activeCount)}
                />
                <StatCard
                  icon="time-outline"
                  iconColor="#F59E0B"
                  title="Pending Review"
                  value={String(pendingCount)}
                />
                <StatCard
                  icon="checkmark-done-outline"
                  iconColor="#10B981"
                  title="Completed"
                  value={String(completedCount)}
                  iconNudge={-1}
                />
              </View>

              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={COLORS.TEXT_SECONDARY}
                />
                <TextInput
                  placeholder="Search by order ID or property..."
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

              {/* FILTERS */}
              <View style={styles.filterRow}>
                <TouchableOpacity 
                  style={styles.filterPill}
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="funnel-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.filterText}>{filterStatus}</Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.filterPill}
                  onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.filterText}>{filterTime}</Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>

              {/* STATUS DROPDOWN */}
              {showStatusDropdown && (
                <View style={styles.dropdown}>
                  {["All Status", "Active", "Pending Review", "Completed"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFilterStatus(status);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Ionicons 
                        name={filterStatus === status ? "checkmark-circle" : "ellipse-outline"} 
                        size={18} 
                        color={filterStatus === status ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                      />
                      <Text style={[styles.dropdownText, filterStatus === status && { fontWeight: "800" }]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* TIME DROPDOWN */}
              {showTimeDropdown && (
                <View style={styles.dropdown}>
                  {["All Time", "Last 7 days", "Last 30 days", "This Year"].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFilterTime(time);
                        setShowTimeDropdown(false);
                      }}
                    >
                      <Ionicons 
                        name={filterTime === time ? "checkmark-circle" : "ellipse-outline"} 
                        size={18} 
                        color={filterTime === time ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                      />
                      <Text style={[styles.dropdownText, filterTime === time && { fontWeight: "800" }]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            !searchLoading && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="document-text-outline" size={28} color={COLORS.TEXT_SECONDARY} />
                </View>
                <Text style={styles.emptyTitle}>No orders found</Text>
                <Text style={styles.emptySub}>Create a property and place your first order.</Text>
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
  listContent: { padding: Spacing.screenPadding, paddingBottom: 32 },

  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
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
  searchInput: { flex: 1, fontSize: 15, color: COLORS.TEXT_PRIMARY, fontWeight: "500" },

  filterRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  filterPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterText: { fontSize: 14, color: COLORS.TEXT_PRIMARY, fontWeight: "700", flex: 1, textAlign: "center" },

  dropdown: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
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
  sampleWrap: {
    marginTop: 2,
    gap: 12,
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
