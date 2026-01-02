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

/* ===================== MOCK DATA ===================== */
/* Web screenshot shows empty state, so we start empty */
const COMPLETED_AMENDS = [];

export default function Amendments() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* SAME HEADER AS DASHBOARD / ORDERS */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Amendments</Text>
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
          data={COMPLETED_AMENDS}
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
                  placeholder="Search Amend"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  style={styles.searchInput}
                />
              </View>

              {/* PRIMARY NAV BUTTONS (ONLY TWO) */}
              <PrimaryNavButton
                icon="add-circle-outline"
                title="Place a New Amend"
                subtitle="Create a new amendment request"
                onPress={() => console.log("Place New Amend")}
              />

              <PrimaryNavButton
                icon="time-outline"
                title="In Process Amends"
                subtitle="Amendments currently being reviewed"
                onPress={() => console.log("In Process Amends")}
              />

              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Completed Amendments
                  </Text>
                  <Text style={styles.sectionSub}>
                    These amendments have been completed.
                  </Text>
                </View>

                <View style={styles.countPill}>
                  <Text style={styles.countText}>
                    {COMPLETED_AMENDS.length}
                  </Text>
                </View>
              </View>
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
      <Ionicons
        name="document-text-outline"
        size={32}
        color={COLORS.TEXT_SECONDARY}
      />
      <Text style={styles.emptyText}>No data found</Text>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },

  /* HEADER */
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
    marginLeft:67
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
  notificationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

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
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    marginTop: 12,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
  },

  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
});
