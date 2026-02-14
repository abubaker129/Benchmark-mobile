import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Colors from "../constants/colors";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";
import Spacing from "../constants/spacing";

const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;

const RANGE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
];

const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getPresetRange(key) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (key === "today") return { from: end, to: end };
  if (key === "last7") {
    const from = new Date(end);
    from.setDate(from.getDate() - 6);
    return { from, to: end };
  }
  if (key === "last30") {
    const from = new Date(end);
    from.setDate(from.getDate() - 29);
    return { from, to: end };
  }
  if (key === "thisMonth") {
    const from = new Date(end.getFullYear(), end.getMonth(), 1);
    return { from, to: end };
  }

  const firstOfCurrent = new Date(end.getFullYear(), end.getMonth(), 1);
  const lastOfPrev = new Date(firstOfCurrent.getTime() - 24 * 60 * 60 * 1000);
  const firstOfPrev = new Date(lastOfPrev.getFullYear(), lastOfPrev.getMonth(), 1);
  return { from: firstOfPrev, to: lastOfPrev };
}

function formatRangeLabel(from, to) {
  return `${monthShort[from.getMonth()]} ${String(from.getDate()).padStart(2, "0")}, ${from.getFullYear()} - ${
    monthShort[to.getMonth()]
  } ${String(to.getDate()).padStart(2, "0")}, ${to.getFullYear()}`;
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function StatCard({ title, value, subtitle, icon, accent }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statLeft}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={[styles.statSubtitle, accent === "success" && styles.successText]}>{subtitle}</Text>
      </View>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
    </View>
  );
}

export default function Statistics() {
  const navigation = useNavigation();
  const { user, session, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetKey, setPresetKey] = useState("last7");

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

  const activeRange = useMemo(() => getPresetRange(presetKey), [presetKey]);
  const rangeLabel = useMemo(
    () => formatRangeLabel(activeRange.from, activeRange.to),
    [activeRange.from, activeRange.to]
  );

  const fetchStats = useCallback(
    async (rangeKey) => {
      if (!user || !session) {
        setStats({
          total_properties: 0,
          in_process_orders: 0,
          pending_review_orders: 0,
          completed_orders: 0,
          in_process_amendments: 0,
          pending_review_amendments: 0,
          completed_amendments: 0,
        });
        return;
      }

      const selectedRange = getPresetRange(rangeKey);
      const fromDateTime = new Date(
        selectedRange.from.getFullYear(),
        selectedRange.from.getMonth(),
        selectedRange.from.getDate(),
        0,
        0,
        0,
        0
      ).toISOString();
      const toDateTime = new Date(
        selectedRange.to.getFullYear(),
        selectedRange.to.getMonth(),
        selectedRange.to.getDate(),
        23,
        59,
        59,
        999
      ).toISOString();

      try {
        setLoading(true);

        const [propertiesRes, ordersRes, amendsRes] = await Promise.all([
          supabase.from("properties").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("status, created_at").gte("created_at", fromDateTime).lte("created_at", toDateTime),
          supabase.from("amends").select("status, created_at").gte("created_at", fromDateTime).lte("created_at", toDateTime),
        ]);

        if (propertiesRes.error) throw propertiesRes.error;
        if (ordersRes.error) throw ordersRes.error;
        if (amendsRes.error) throw amendsRes.error;

        const orders = ordersRes.data || [];
        const amends = amendsRes.data || [];

        const inProcessOrders = orders.filter((o) => o.status === "active" || o.status === "in_process").length;
        const pendingOrders = orders.filter((o) => o.status === "pending_review").length;
        const completedOrders = orders.filter((o) => o.status === "completed").length;

        const inProcessAmends = amends.filter((a) => a.status === "active" || a.status === "in_process").length;
        const pendingAmends = amends.filter((a) => a.status === "pending_review").length;
        const completedAmends = amends.filter((a) => a.status === "completed").length;

        setStats({
          total_properties: propertiesRes.count || 0,
          in_process_orders: inProcessOrders,
          pending_review_orders: pendingOrders,
          completed_orders: completedOrders,
          in_process_amendments: inProcessAmends,
          pending_review_amendments: pendingAmends,
          completed_amendments: completedAmends,
        });
      } catch (e) {
        setStats({
          total_properties: 0,
          in_process_orders: 0,
          pending_review_orders: 0,
          completed_orders: 0,
          in_process_amendments: 0,
          pending_review_amendments: 0,
          completed_amendments: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [user, session]
  );

  useEffect(() => {
    if (authLoading) return;
    fetchStats(presetKey);
  }, [authLoading, fetchStats, presetKey]);

  const ordersActive = stats?.in_process_orders ?? 0;
  const ordersPending = stats?.pending_review_orders ?? 0;
  const ordersCompleted = stats?.completed_orders ?? 0;

  const amendsActive = stats?.in_process_amendments ?? 0;
  const amendsPending = stats?.pending_review_amendments ?? 0;
  const amendsCompleted = stats?.completed_amendments ?? 0;

  const totalProperties = stats?.total_properties ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Statistics" onMenuPress={openDrawer} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.rangePill} onPress={() => setPresetOpen(true)}>
          <Ionicons name="calendar-clear-outline" size={17} color="#fff" />
          <Text style={styles.rangeText}>{rangeLabel}</Text>
        </Pressable>

        <SectionTitle title="Orders Overview" />
        <StatCard title="Active Orders" value={ordersActive} subtitle="In progress" icon="document-text-outline" />
        <StatCard title="Pending Review" value={ordersPending} subtitle="Awaiting review" icon="time-outline" />
        <StatCard
          title="Completed Orders"
          value={ordersCompleted}
          subtitle="All time"
          icon="checkmark-circle-outline"
          accent="success"
        />

        <SectionTitle title="Amends Overview" />
        <StatCard title="Active Amends" value={amendsActive} subtitle="In progress" icon="create-outline" />
        <StatCard title="Pending Review" value={amendsPending} subtitle="Awaiting review" icon="time-outline" />
        <StatCard
          title="Completed Amends"
          value={amendsCompleted}
          subtitle="All time"
          icon="checkmark-circle-outline"
          accent="success"
        />

        <SectionTitle title="Properties" />
        <StatCard title="Total Properties" value={totalProperties} subtitle="All listings" icon="business-outline" />

        <SectionTitle title="Recent Orders" />
        <View style={styles.recentCard}>
          {loading ? (
            <ActivityIndicator color={PRIMARY} />
          ) : (
            <>
              <View style={styles.recentIcon}>
                <Ionicons name="document-text-outline" size={27} color="#fff" />
              </View>
              <Text style={styles.recentTitle}>No orders yet</Text>
              <Text style={styles.recentSub}>Create a property and place your first order</Text>
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={presetOpen} transparent animationType="fade" onRequestClose={() => setPresetOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPresetOpen(false)}>
          <Pressable style={styles.presetPanel} onPress={(e) => e.stopPropagation?.()}>
            {RANGE_PRESETS.map((item) => {
              const selected = item.key === presetKey;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.presetRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    setPresetKey(item.key);
                    setPresetOpen(false);
                  }}
                >
                  <Text style={[styles.presetText, selected && styles.presetTextSelected]}>{item.label}</Text>
                  {selected ? <Ionicons name="checkmark" size={18} color={PRIMARY} /> : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  content: { padding: Spacing.screenPadding, paddingBottom: 28 },
  rangePill: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rangeText: { color: "#fff", marginLeft: 10, fontSize: 17, fontWeight: "700" },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#27323a", marginTop: 6, marginBottom: 10 },
  statCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 4 },
    }),
  },
  statLeft: { flex: 1, paddingRight: 12 },
  statTitle: { fontSize: 16, fontWeight: "700", color: "#5d7384", marginBottom: 4 },
  statValue: { fontSize: 46, lineHeight: 50, fontWeight: "900", color: "#23323f" },
  statSubtitle: { marginTop: 4, fontSize: 15, fontWeight: "500", color: "#607483" },
  successText: { color: Colors.success, fontWeight: "700" },
  statIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
      android: { elevation: 3 },
    }),
  },

  recentCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  recentIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  recentTitle: { fontSize: 18, fontWeight: "700", color: "#5e707f" },
  recentSub: { marginTop: 8, textAlign: "center", color: "#667b8b", fontSize: 14, fontWeight: "500" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.32)", justifyContent: "center", paddingHorizontal: 20 },
  presetPanel: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
  },
  presetRow: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  presetText: { fontSize: 18, color: "#24313d", fontWeight: "500" },
  presetTextSelected: { color: PRIMARY, fontWeight: "700" },
});
