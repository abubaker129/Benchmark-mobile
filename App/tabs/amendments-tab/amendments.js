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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Colors from "../../constants/colors";
import AppHeader from "../../components/AppHeader";
import Spacing from "../../constants/spacing";
import { AMEND_STATUS, listAmends } from "../../api/amends.api";

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
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Awaiting Data", value: "awaiting_data" },
  { label: "Pending Review", value: "pending_check" },
  { label: "Checking", value: "checking" },
  { label: "Completed", value: "completed" },
];

function formatDate(iso) {
  if (!iso) return "N/A";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
}

function getPropertyLabel(amend) {
  return amend?.order?.property?.name || amend?.order?.property?.street || "Unknown property";
}

function getStatusPill(status) {
  switch (status) {
    case "completed":
      return { text: "#0F766E", bg: "#CCFBF1" };
    case "pending_check":
    case "checking":
      return { text: "#92400E", bg: "#FEF3C7" };
    case "in_progress":
      return { text: "#1D4ED8", bg: "#DBEAFE" };
    case "awaiting_data":
    case "checker_rejected":
    case "worker_rejected":
      return { text: "#B45309", bg: "#FDE68A" };
    default:
      return { text: "#374151", bg: "#E5E7EB" };
  }
}

export default function Amendments() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [amends, setAmends] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadAmends = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAmends();
      setAmends(data);
    } catch (error) {
      setAmends([]);
      Alert.alert("Failed to load amendments", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const parent = getDrawerParent();
      parent?.closeDrawer?.();
      loadAmends();
    }, [getDrawerParent, loadAmends])
  );

  const filteredAmends = useMemo(() => {
    const q = search.trim().toLowerCase();

    return amends.filter((amend) => {
      const statusMatch = filterStatus === "all" || amend.status === filterStatus;
      if (!statusMatch) return false;

      if (!q) return true;

      const orderNumber = String(amend?.order?.order_number || "").toLowerCase();
      const property = String(getPropertyLabel(amend) || "").toLowerCase();
      const amendId = String(amend?.id || "").toLowerCase();
      return orderNumber.includes(q) || property.includes(q) || amendId.includes(q);
    });
  }, [amends, filterStatus, search]);

  const activeAmends = useMemo(
    () => filteredAmends.filter((a) => ["pending", "in_progress", "awaiting_data"].includes(a.status)).length,
    [filteredAmends]
  );
  const pendingReviewAmends = useMemo(
    () => filteredAmends.filter((a) => ["pending_check", "checking"].includes(a.status)).length,
    [filteredAmends]
  );
  const completedAmends = useMemo(
    () => filteredAmends.filter((a) => a.status === "completed").length,
    [filteredAmends]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Amendments" onMenuPress={openDrawer} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={filteredAmends}
          keyExtractor={(item, index) => item?.id || String(index)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.statsGrid}>
                <StatCard icon="time-outline" iconColor="#2B9CCC" title="Active Amends" value={String(activeAmends)} />
                <StatCard
                  icon="alert-circle-outline"
                  iconColor="#F59E0B"
                  title="Pending Review"
                  value={String(pendingReviewAmends)}
                />
                <StatCard
                  icon="checkmark-done-outline"
                  iconColor="#10B981"
                  title="Completed"
                  value={String(completedAmends)}
                  iconNudge={-1}
                />
              </View>

              <PrimaryNavButton
                icon="add-outline"
                title="Place Amendment"
                subtitle="Create a new amendment request"
                onPress={() => navigation.navigate("PlaceAmendment")}
              />

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={COLORS.TEXT_SECONDARY} />
                <TextInput
                  placeholder="Search by amend ID or property..."
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterPill}
                  onPress={() => setShowStatusDropdown((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="funnel-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.filterText}>
                    {STATUS_OPTIONS.find((s) => s.value === filterStatus)?.label || "All Status"}
                  </Text>
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
            </>
          }
          renderItem={({ item }) => (
            <CompletedAmendCard
              amend={item}
              onPress={() => navigation.navigate("PlaceAmendment", { orderId: item?.order_id })}
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

function CompletedAmendCard({ amend, onPress }) {
  const pill = getStatusPill(amend?.status);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.orderCode}>{amend?.order?.order_number || "N/A"}</Text>
          <Text style={styles.propertyText} numberOfLines={1}>
            {getPropertyLabel(amend)}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.statusPillText, { color: pill.text }]}>{AMEND_STATUS[amend?.status] || "Pending"}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>Created {formatDate(amend?.created_at)}</Text>
        <Text style={styles.cardLink}>Open</Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="document-outline" size={40} color={COLORS.PRIMARY} />
      </View>
      <Text style={styles.emptyTitle}>No amendments found</Text>
      <Text style={styles.emptySub}>Create a new amendment to get started</Text>
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
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  cardLink: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});
