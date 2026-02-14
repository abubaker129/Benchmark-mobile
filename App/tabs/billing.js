import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Colors from "../constants/colors";
import AppHeader from "../components/AppHeader";
import Spacing from "../constants/spacing";

const STAT_CARDS = [
  { id: "free", label: "Free Services Left", value: "5", icon: "gift-outline", color: "#2B9CCC" },
  { id: "balance", label: "Current Balance", value: "$0.00", icon: "cash-outline", color: "#3B82F6" },
  { id: "limit", label: "Credit Limit", value: "$50.00", icon: "cash-outline", color: "#10B981" },
  { id: "due", label: "Outstanding", value: "$0.00", icon: "warning-outline", color: "#64748B" },
];

const INVOICE_FILTERS = ["All", "Paid", "Open", "Overdue"];

export default function Billing() {
  const navigation = useNavigation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("All");

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

  const info = useMemo(
    () => ({
      freeLeft: 5,
      freeTotal: 5,
      creditLimit: 50,
      outstanding: 0,
    }),
    []
  );

  const freePct = Math.min(1, info.freeLeft / info.freeTotal);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Billing & Payments" onMenuPress={openDrawer} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {STAT_CARDS.map((card) => (
            <View key={card.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${card.color}22` }]}>
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIcon}>
              <Ionicons name="card-outline" size={20} color={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Payment Method</Text>
              <Text style={styles.cardSub}>No payment method on file</Text>
            </View>
          </View>
          <Text style={styles.cardInfo}>
            You have {info.freeLeft} free services remaining. Add a payment method before they run out.
          </Text>
          <Pressable style={styles.primaryBtn}>
            <Ionicons name="card-outline" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Add Payment Method</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="gift-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Free Services</Text>
            </View>
            <Text style={styles.sectionSub}>Your first {info.freeTotal} services are completely free</Text>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Used</Text>
            <Text style={styles.progressValue}>
              {info.freeTotal - info.freeLeft} of {info.freeTotal}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(1 - freePct) * 100}%` }]} />
          </View>
          <Text style={styles.progressFooter}>{info.freeLeft} free services remaining</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text-outline" size={20} color={Colors.text} />
            <Text style={styles.sectionTitle}>Invoice History</Text>
          </View>

          <Pressable style={styles.select} onPress={() => setFilterOpen((p) => !p)}>
            <Text style={styles.selectText}>{filter}</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
          </Pressable>

          {filterOpen && (
            <View style={styles.selectMenu}>
              {INVOICE_FILTERS.map((item) => (
                <Pressable
                  key={item}
                  style={styles.selectItem}
                  onPress={() => {
                    setFilter(item);
                    setFilterOpen(false);
                  }}
                >
                  <Ionicons
                    name={filter === item ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={filter === item ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={styles.selectItemText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={26} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No invoices found</Text>
            <Text style={styles.emptySub}>Open: 0</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How Billing Works</Text>
          <Text style={styles.sectionSub}>
            Simple, transparent pricing with no surprises
          </Text>
          <View style={styles.steps}>
            <Step index={1} text="Your first 5 services are completely free – no credit card required" />
            <Step index={2} text="After free services, add a payment method to continue" />
            <Step index={3} text="Charges accumulate until you reach your $50.00 credit limit" />
            <Step index={4} text="When the limit is reached, we'll automatically invoice your card" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ index, text }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNum}>{index}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: 28,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 16, fontWeight: "800", color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: Colors.text },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardInfo: { marginTop: 10, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  primaryBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  sectionHeader: { marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  sectionSub: { marginTop: 6, fontSize: 12, color: Colors.textSecondary },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  progressValue: { fontSize: 12, fontWeight: "700", color: Colors.text },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  progressFooter: { marginTop: 8, fontSize: 12, color: Colors.textSecondary },

  select: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 14, color: Colors.text, fontWeight: "600" },
  selectMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectItemText: { fontSize: 14, color: Colors.text, fontWeight: "600" },

  emptyState: {
    marginTop: 18,
    alignItems: "center",
    paddingVertical: 18,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary },
  emptySub: { marginTop: 10, fontSize: 12, color: Colors.textSecondary },

  steps: { marginTop: 10, gap: 10 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "800", color: Colors.primary },
  stepText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
