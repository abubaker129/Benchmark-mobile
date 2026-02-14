import React, { useState, useCallback } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Colors from "../../constants/colors";
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

/* ===================== MOCK DATA ===================== */
/* Web screenshot shows empty state, so we start empty */
const COMPLETED_AMENDS = [];

export default function Amendments() {
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
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader title="Amendments" onMenuPress={openDrawer} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={COMPLETED_AMENDS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* STAT CARDS */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="time-outline"
                  iconColor="#2B9CCC"
                  title="Active Amends"
                  value="0"
                  // description="In progress"
                />
                <StatCard
                  icon="alert-circle-outline"
                  iconColor="#F59E0B"
                  title="Pending Review"
                  value="0"
                  // description="Awaiting review"
                />
                <StatCard
                  icon="checkmark-done-outline"
                  iconColor="#10B981"
                  title="Completed"
                  value="0"
                  iconNudge={-1}
                  // description="Finished"
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
                  placeholder="Search by amend ID or property..."
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  style={styles.searchInput}
                />
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
              </View>

              {/* STATUS DROPDOWN */}
              {showStatusDropdown && (
                <View style={styles.dropdown}>
                  {["All Status", "Pending", "In Progress", "Awaiting Data", "Pending Check", "Checking", "Completed"].map((status) => (
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
            </>
          }
          renderItem={({ item }) => <CompletedAmendCard amend={item} />}
          ListEmptyComponent={<EmptyState />}
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

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color="#fff"
      />
    </TouchableOpacity>
  );
}

function CompletedAmendCard({ amend }) {
  return (
    <View style={styles.card}>
      <Text style={styles.emptyText}>
        Amend card placeholder
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="document-outline"
          size={40}
          color={COLORS.PRIMARY}
        />
      </View>
      <Text style={styles.emptyTitle}>No amendments found</Text>
      <Text style={styles.emptySub}>
        Create a new amendment to get started
      </Text>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },

  listContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 32,
  },

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

  /* PRIMARY BUTTONS */
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

  /* EMPTY STATE */
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
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
});
