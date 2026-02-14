import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Modal,
  FlatList,
  ScrollView,
  TextInput,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../api/client";
import Colors from "../constants/colors";

/* THEME ALIASES FROM GLOBAL COLORS */
const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;

/* DATE DATA */
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

/* STATISTICS (FORMER DASHBOARD) */
export default function Statistics() {
  const [fromDate, setFromDate] = useState({ day: 26, month: 11, year: 2025 });
  const [toDate, setToDate] = useState({ day: 26, month: 11, year: 2025 });
  const [pickerType, setPickerType] = useState(null);
const [rangeStep, setRangeStep] = useState("start"); // "start" | "end"

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const { logout } = useAuth();
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

  const [authReady, setAuthReady] = useState(false);

  // Search UI (requested)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const formatDate = (d) =>
    `${String(d.day).padStart(2, "0")}/${String(d.month + 1).padStart(2, "0")}/${d.year}`;

  const toApiDate = ({ day, month, year }) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const fetchStats = async (useFilters = false) => {
    try {
      setLoadingStats(true);

      let path = "/ordersstats";
      if (useFilters) {
        path += `?from_date=${toApiDate(fromDate)}&to_date=${toApiDate(toDate)}`;
      }

      const data = await apiFetch(path, {}, async () => {
        await logout();
        navigation.replace("Login");
      });

      setStats(data);
    } catch (e) {
    } finally {
      setLoadingStats(false);
    }
  };

  // Auth bootstrap check ONCE
  useEffect(() => {
    const boot = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          await logout();
          navigation.replace("Login");
          return;
        }
        setAuthReady(true);
      } catch (e) {
        await logout();
        navigation.replace("Login");
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    fetchStats(false);
  }, [authReady]);

const onConfirmDateRange = ({ from, to }) => {
  setFromDate(from);
  setToDate(to);
  setPickerType(null);
  setRangeStep("start");
};

  // close search when tapping anywhere else
  const closeSearchIfOpen = () => {
    if (!searchOpen) return;
    Keyboard.dismiss();
    setSearchOpen(false);
  };

  // Map API → UI (safe fallbacks)
  const ordersActive = stats?.in_process_orders ?? 0;
  const ordersPending = stats?.pending_review_orders ?? 0; // if backend adds later
  const ordersCompleted = stats?.completed_orders ?? 0;

  const amendsActive = stats?.in_process_amendments ?? 0;
  const amendsPending = stats?.pending_review_amendments ?? 0; // if backend adds later
  const amendsCompleted = stats?.completed_amendments ?? 0;

  const totalProperties = stats?.total_properties ?? 0; // if backend adds later

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      {/* TOP HEADER (clean layout: profile + centered title + notification) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={openDrawer} style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSubtitle}>Track your service metrics</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.notification}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>7</Text>
            </View>
          </View>
        </View>
      </View>
      {/* Search field opens under header (above modal + outside ScrollView) */}
      {searchOpen && (
        <Pressable style={styles.searchOverlay} onPress={closeSearchIfOpen}>
          <Pressable
            style={styles.searchBarUnderHeader}
            onPress={(e) => {
              // prevent overlay closing when tapping inside input container
              e.stopPropagation?.();
            }}
          >
            <Ionicons name="search" size={16} color={TEXT_SECONDARY} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
              style={styles.searchInputTop}
              returnKeyType="search"
              onSubmitEditing={() => {
                // UI-only for now (connect to your search logic later)
                // Example: navigation.navigate("Orders", { q: searchText })
              }}
              autoFocus
            />
          </Pressable>
        </Pressable>
      )}

      {/* Whole screen tap closes search */}
      <Pressable style={{ flex: 1 }} onPress={closeSearchIfOpen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
         
          {/* Welcome */}
          <Text style={styles.welcomeTitle}>Welcome back, abubaker</Text>
          <Text style={styles.welcomeSub}>Here's an overview of your orders and amends</Text>

           {/* FILTER (now at the top) */}
          <View style={styles.filterCard}>
            <View style={styles.filterTopRow}>
              
              <View style={styles.filterTitleWrap}>
                <Text style={styles.filterTitle}>Date Filters</Text>
                <Text style={styles.filterSub}>Refine your stats by time period</Text>
              </View>
              <View style={styles.filterIconPill}>
                <Ionicons name="time-outline" size={18} color={PRIMARY} />
              </View>
            </View>

            <View style={styles.dateRow}>
              <DatePill
                icon="calendar-outline"
                label={`${formatDate(fromDate)} - ${formatDate(toDate)}`}
                onPress={() => {
                  setRangeStep("start");
                  setPickerType("range");
                }}
              />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => fetchStats(true)}
                disabled={loadingStats}
                activeOpacity={0.9}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {loadingStats ? "Loading..." : "Apply"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => fetchStats(false)}
                activeOpacity={0.9}
              >
                <Ionicons name="refresh-outline" size={18} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>


          {/* PROPERTIES - AT THE TOP */}
          <SectionTitle title="Properties" />
          <View style={styles.fullWidthGrid}>
            <OverviewCard
              title="Total Properties"
              value={totalProperties}
              subtitle="All listings"
              icon="home-outline"
            />
          </View>

          {/* ORDERS OVERVIEW - 2 IN ROW */}
          <SectionTitle title="Orders Overview" />
          <View style={styles.twoColumnGrid}>
            <OverviewCard
              title="Active Orders"
              value={ordersActive}
              subtitle="In progress"
              icon="document-text-outline"
            />
            <OverviewCard
              title="Pending Review"
              value={ordersPending}
              subtitle="Awaiting review"
              icon="time-outline"
            />
          </View>
          {/* Third card in full width */}
          <View style={styles.fullWidthGrid}>
            <OverviewCard
              title="Completed Orders"
              value={ordersCompleted}
              subtitle="All time"
              icon="checkmark-done-outline"
              accent="success"
            />
          </View>

          {/* AMENDS OVERVIEW - 2 IN ROW */}
          <SectionTitle title="Amends Overview" />
          <View style={styles.twoColumnGrid}>
            <OverviewCard
              title="Active Amends"
              value={amendsActive}
              subtitle="In progress"
              icon="create-outline"
            />
            <OverviewCard
              title="Pending Review"
              value={amendsPending}
              subtitle="Awaiting review"
              icon="time-outline"
            />
          </View>
          {/* Third card in full width */}
          <View style={styles.fullWidthGrid}>
            <OverviewCard
              title="Completed Amends"
              value={amendsCompleted}
              subtitle="All time"
              icon="checkmark-done-outline"
              accent="success"
            />
          </View>

          {/* RECENT ORDERS */}
          <SectionTitle title="Recent Orders" />
          <View style={styles.recentCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={26} color="#fff" />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Create a property and place your first order</Text>
          </View>
        </ScrollView>
      </Pressable>

      {/* DATE PICKER MODAL */}
   <DatePickerModal
  visible={pickerType === "range"}
  fromDate={fromDate}
  toDate={toDate}
  rangeStep={rangeStep}
  setRangeStep={setRangeStep}
  onClose={() => {
    setPickerType(null);
    setRangeStep("start");
  }}
  onConfirm={onConfirmDateRange}
/>

    </SafeAreaView>
  );
}

/* UI COMPONENTS */

function SectionTitle({ title }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function OverviewCard({ title, value, subtitle,  accent }) {
  const subtitleColor = accent === "success" ? Colors.success : TEXT_SECONDARY;

  return (
    <View style={styles.overviewCard}>
      <View style={styles.overviewAccent} />
      <View style={styles.overviewMetaRow}>
       
      </View>

      <Text style={styles.overviewTitle}>{title}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
      <Text style={[styles.overviewSub, { color: subtitleColor }]}>{subtitle}</Text>
    </View>
  );
}

function DatePill({ label, onPress, icon }) {
  return (
    <Pressable style={styles.datePill} onPress={onPress}>
      <View style={styles.datePillIcon}>
        <Ionicons name={icon} size={16} color={PRIMARY} />
      </View>
      <View style={styles.datePillTextWrap}>
        <Text style={styles.datePillText}>{label}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={TEXT_SECONDARY} />
    </Pressable>
  );
}

/* DATE PICKER MODAL (UPGRADED UI — calendar grid) */
function DatePickerModal({
  visible,
  fromDate,
  toDate,
  rangeStep,
  setRangeStep,
  onClose,
  onConfirm,
}) {
  // use current visible month from "fromDate"
  const [cursorYear, setCursorYear] = useState(fromDate.year);
  const [cursorMonth, setCursorMonth] = useState(fromDate.month); // 0-11

  // internal selected range
  const [start, setStart] = useState(fromDate);
  const [end, setEnd] = useState(toDate);

  useEffect(() => {
    setCursorYear(fromDate.year);
    setCursorMonth(fromDate.month);
    setStart(fromDate);
    setEnd(toDate);
  }, [fromDate, toDate, visible]);

  const monthLabel = `${months[cursorMonth]} ${cursorYear}`;

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay(); // 0=Sun

  const maxDay = daysInMonth(cursorYear, cursorMonth);
  const first = firstWeekday(cursorYear, cursorMonth);

  const toTime = (d) => new Date(d.year, d.month, d.day).getTime();

  const isSameDay = (a, b) =>
    a?.day === b?.day && a?.month === b?.month && a?.year === b?.year;

  const inRange = (d) => {
    const t = toTime(d);
    const s = toTime(start);
    const e = toTime(end);
    return t >= Math.min(s, e) && t <= Math.max(s, e);
  };

  const goPrev = () => {
    const nextMonth = cursorMonth === 0 ? 11 : cursorMonth - 1;
    const nextYear = cursorMonth === 0 ? cursorYear - 1 : cursorYear;
    setCursorMonth(nextMonth);
    setCursorYear(nextYear);
  };

  const goNext = () => {
    const nextMonth = cursorMonth === 11 ? 0 : cursorMonth + 1;
    const nextYear = cursorMonth === 11 ? cursorYear + 1 : cursorYear;
    setCursorMonth(nextMonth);
    setCursorYear(nextYear);
  };

  const onPickDay = (day) => {
    const picked = { day, month: cursorMonth, year: cursorYear };

    if (rangeStep === "start") {
      setStart(picked);
      setEnd(picked);
      setRangeStep("end");
      return;
    }

    // end step
    const s = toTime(start);
    const e = toTime(picked);

    if (e < s) {
      setStart(picked);
      setEnd(start);
    } else {
      setEnd(picked);
    }

    // keep step end, user can adjust further or press confirm
  };

  const cells = [];
  for (let i = 0; i < first; i++) cells.push({ key: `b-${i}`, blank: true });
  for (let d = 1; d <= maxDay; d++) cells.push({ key: `d-${d}`, day: d, blank: false });
  while (cells.length % 7 !== 0) cells.push({ key: `p-${cells.length}`, blank: true });

  const confirm = () => {
    // ensure from <= to
    const s = toTime(start);
    const e = toTime(end);
    const from = s <= e ? start : end;
    const to = s <= e ? end : start;
    onConfirm({ from, to });
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.calendarModal} onPress={(e) => e.stopPropagation?.()}>
          {/* Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.navBtn} onPress={goPrev} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={18} color={PRIMARY} />
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <Text style={styles.calendarTitle}>{monthLabel}</Text>
              <Text style={{ color: TEXT_SECONDARY, marginTop: 4, fontWeight: "700" }}>
                {rangeStep === "start" ? "Select start date" : "Select end date"}
              </Text>
              <Text style={{ color: TEXT_PRIMARY, marginTop: 4, fontWeight: "800" }}>
                {String(start.day).padStart(2,"0")}/{String(start.month+1).padStart(2,"0")}/{start.year}
                {"  -  "}
                {String(end.day).padStart(2,"0")}/{String(end.month+1).padStart(2,"0")}/{end.year}
              </Text>
            </View>

            <TouchableOpacity style={styles.navBtn} onPress={goNext} activeOpacity={0.8}>
              <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.weekRow}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((w) => (
              <Text key={w} style={styles.weekDay}>{w}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.gridWrap}>
            {cells.map((c) => {
              if (c.blank) return <View key={c.key} style={styles.dayCell} />;

              const dObj = { day: c.day, month: cursorMonth, year: cursorYear };
              const selectedStart = isSameDay(dObj, start);
              const selectedEnd = isSameDay(dObj, end);
              const inside = inRange(dObj);

              return (
                <Pressable
                  key={c.key}
                  onPress={() => onPickDay(c.day)}
                  style={[
                    styles.dayCell,
                    styles.dayBtn,
                    inside && styles.dayInRange,
                    (selectedStart || selectedEnd) && styles.daySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      (selectedStart || selectedEnd) && styles.dayTextSelected,
                    ]}
                  >
                    {c.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => {
                setRangeStep("start");
                setStart(fromDate);
                setEnd(toDate);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={confirm} activeOpacity={0.8}>
              <Text style={styles.modalConfirm}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}


/* STYLES */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: { width: 50, alignItems: "flex-start" },
  avatarBtn: { borderRadius: 22 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 },

  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 13, color: "#ffffff99", marginTop: 2, fontWeight: "500" },

  headerRight: { width: 50, alignItems: "flex-end" },
  notification: { position: "relative", width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  dayInRange: {
    backgroundColor: "rgba(43,156,204,0.18)", // uses your theme color tint
    borderColor: "rgba(43,156,204,0.18)",
  },

  scrollContent: { padding: 16, paddingBottom: 32 },

  welcomeTitle: { fontSize: 24, fontWeight: "900", color: TEXT_PRIMARY, marginTop: 10, letterSpacing: 0.3 },
  welcomeSub: { marginTop: 6, color: TEXT_SECONDARY, marginBottom: 18, fontSize: 15, fontWeight: "500" },

  // Filter card
  filterCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    backgroundColor: "#F7FBFF",
    ...Platform.select({
      ios: { shadowColor: "#0f172a", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 5 },
    }),
  },

  filterTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  filterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(43,156,204,0.15)",
    borderWidth: 1,
    borderColor: "rgba(43,156,204,0.3)",
  },
  // filterBadgeText: { fontSize: 10, fontWeight: "900", color: PRIMARY, letterSpacing: 0.6 },
  filterTitleWrap: { flex: 1 },
  filterTitle: { fontSize: 16, fontWeight: "900", color: TEXT_PRIMARY, letterSpacing: 0.3 },
  filterSub: { marginTop: 2, fontSize: 12, color: TEXT_SECONDARY, fontWeight: "600" },
  filterIconPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EAF5FB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(43,156,204,0.2)",
  },

  squareIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(43,156,204,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(43,156,204,0.25)",
  },

  searchWrap: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: "#fbfdff",
  },

  searchInput: { flex: 1, color: TEXT_PRIMARY, fontSize: 15, fontWeight: "500" },

  dateRow: { marginTop: 6 },

  datePill: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: { shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
      android: { elevation: 1 },
    }),
  },

  datePillIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(43,156,204,0.12)",
    borderWidth: 1,
    borderColor: "rgba(43,156,204,0.18)",
  },
  datePillTextWrap: { flex: 1, marginLeft: 12 },
  datePillText: { color: TEXT_PRIMARY, fontWeight: "800", fontSize: 15 },

  actionsRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },

  primaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: "#0f172a", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 4 },
    }),
  },

  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  ghostBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EAF5FB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(43,156,204,0.25)",
  },

  // Sections
  sectionTitleRow: { marginTop: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "900", color: TEXT_PRIMARY, letterSpacing: 0.3 },

  // Cards grid
  grid: { gap: 14 },

  overviewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
      android: { elevation: 6 },
    }),
  },

  overviewAccent: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(43,156,204,0.25)",
    marginBottom: 12,
  },
  overviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  overviewMetaText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700" },
  overviewMetaDot: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: "700" },

  overviewTitle: { color: TEXT_SECONDARY, fontWeight: "700", marginBottom: 12, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },

  overviewValue: { marginTop: 4, fontSize: 36, fontWeight: "900", color: TEXT_PRIMARY, lineHeight: 42 },
  overviewSub: { marginTop: 10, fontWeight: "700", fontSize: 14, letterSpacing: 0.3 },

  // Recent Orders empty card
  recentCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
      android: { elevation: 6 },
    }),
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 4 },
    }),
  },

  emptyTitle: { fontSize: 18, fontWeight: "900", color: TEXT_PRIMARY, marginTop: 8 },
  emptySub: { color: TEXT_SECONDARY, textAlign: "center", marginTop: 8, fontSize: 15, fontWeight: "500" },

  /* Search overlay under header */
  searchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },

  searchBarUnderHeader: {
    marginTop: 66, // under header
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#fbfdff",
  },

  searchInputTop: { flex: 1, color: TEXT_PRIMARY, fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Calendar Modal (upgraded) */
  calendarModal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    width: "88%",
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
    }),
  },

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfdff",
  },

  calendarTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT_PRIMARY,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  weekDay: {
    width: "14.285%",
    textAlign: "center",
    color: TEXT_SECONDARY,
    fontWeight: "800",
    fontSize: 12,
  },

  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.285%",
    aspectRatio: 1,
    padding: 4,
  },

  dayBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfdff",
  },

  daySelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  dayText: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },

  dayTextSelected: {
    color: "#fff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  modalCancel: { color: TEXT_SECONDARY, fontWeight: "700" },
  modalConfirm: { color: PRIMARY, fontWeight: "900" },

  twoColumnGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  fullWidthGrid: {
    width: "100%",
    marginBottom: 14,
  },
});


