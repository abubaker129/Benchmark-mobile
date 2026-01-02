import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

/* THEME  */
const PRIMARY = "#0c4a6e";
const BG = "#ffffffff";
const CARD_BG = "#f3f6fb";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#010308ff";
const BORDER = "#e5e7eb";
const PROGRESS_BG = "#a9bce2ff";
const PROGRESS_FILL = "#0c4a6e";

/*  DATE DATA  */
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

/*  DASHBOARD  */
export default function Dashboard() {
  const [fromDate, setFromDate] = useState({ day: 26, month: 11, year: 2025 });
  const [toDate, setToDate] = useState({ day: 26, month: 11, year: 2025 });
  const [pickerType, setPickerType] = useState(null);

  const formatDate = (d) =>
    `${String(d.day).padStart(2, "0")}/${String(d.month + 1).padStart(2, "0")}/${d.year}`;

  const onConfirmDate = (date) => {
    if (pickerType === "from") setFromDate(date);
    if (pickerType === "to") setToDate(date);
    setPickerType(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <View style={styles.notification}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>7</Text>
          </View>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* WELCOME */}
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.company}>Interstellar Institute</Text>

        {/* FILTER CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="options-outline" size={18} color={PRIMARY} />
            <Text style={styles.cardTitle}>Date Filters</Text>
          </View>

          <View style={styles.row}>
            <DateInput
              label="FROM"
              value={formatDate(fromDate)}
              onPress={() => setPickerType("from")}
            />
            <DateInput
              label="TO"
              value={formatDate(toDate)}
              onPress={() => setPickerType("to")}
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Ionicons name="search" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Apply Filters</Text>
            </TouchableOpacity>

            <IconButton icon="refresh-outline" />
            <IconButton icon="download-outline" />
          </View>
        </View>

        {/* ORDERS */}
        <StatsSection
          title="Orders Statistics"
          totalLabel="Total Orders"
          totalValue="12"
          left={{ label: "In Process", value: "5", percent: "45%" }}
          right={{ label: "Completed", value: "7", percent: "65%" }}
        />

        {/* AMENDMENTS */}
        <StatsSection
          title="Amendments Statistics"
          totalLabel="Total Amendments"
          totalValue="9"
          left={{ label: "In Process", value: "3", percent: "30%" }}
          right={{ label: "Completed", value: "6", percent: "60%" }}
        />
      </ScrollView>

      {/* DATE PICKER */}
      <DatePickerModal
        visible={!!pickerType}
        initial={pickerType === "from" ? fromDate : toDate}
        onClose={() => setPickerType(null)}
        onConfirm={onConfirmDate}
      />
    </SafeAreaView>
  );
}

/*  COMPONENTS  */

function DateInput({ label, value, onPress }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={onPress}>
        <Text style={styles.inputText}>{value}</Text>
        <Ionicons name="calendar-outline" size={16} color={TEXT_SECONDARY} />
      </Pressable>
    </View>
  );
}

function IconButton({ icon }) {
  return (
    <TouchableOpacity style={styles.iconBtn}>
      <Ionicons name={icon} size={18} color={PRIMARY} />
    </TouchableOpacity>
  );
}

function StatsSection({ title, totalLabel, totalValue, left, right }) {
  return (
    <View style={styles.section}>
<View style={styles.sectionHeader}>
  <Ionicons
    name={title.includes("Order") ? "cube-outline" : "document-text-outline"}
    size={20}
    color={TEXT_SECONDARY}
  />
  <Text style={styles.sectionTitle}>{title}</Text>
</View>
      <View style={[styles.card, styles.totalCard]}>
  <View style={styles.totalRow}>
    <View>
      <Text style={styles.totalLabel}>{totalLabel}</Text>
      <Text style={styles.totalValue}>{totalValue}</Text>
    </View>

    <View style={styles.totalIcon}>
      <Ionicons
        name={
          totalLabel.includes("Order")
            ? "stats-chart-outline"
            : "document-outline"
        }
        size={32}
        color={PRIMARY}
      />
    </View>
  </View>
</View>


      <View style={styles.row}>
        <MiniStat {...left} />
        <MiniStat {...right} />
      </View>
    </View>
  );
}

function MiniStat({ label, value, percent }) {
  return (
    <View style={[styles.card, styles.miniCard]}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>

      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: percent }]} />
      </View>
    </View>
  );
}

/* DATE PICKER */

function DatePickerModal({ visible, initial, onClose, onConfirm }) {
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Select Date</Text>

          <View style={styles.pickerRow}>
            <PickerColumn data={days} value={day} onSelect={setDay} />
            <PickerColumn
              data={months}
              value={months[month]}
              onSelect={(v) => setMonth(months.indexOf(v))}
            />
            <PickerColumn data={years} value={year} onSelect={setYear} />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onConfirm({ day, month, year })}
            >
              <Text style={styles.modalConfirm}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PickerColumn({ data, value, onSelect }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.toString()}
      style={{ height: 140 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item)}>
          <Text
            style={[
              styles.pickerItem,
              item === value && styles.pickerActive,
            ]}
          >
            {item}
          </Text>
        </Pressable>
      )}
    />
  );
}

/* STYLES  */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  header: {
    backgroundColor: PRIMARY,
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

  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" ,marginLeft:74},

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

  scrollContent: { padding: 16, paddingBottom: 32 },

  welcome: { fontSize: 20, color: TEXT_PRIMARY },
  company: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 16,
  },

  section: { marginTop: 28 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    // marginBottom: 12,
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  cardTitle: { fontSize: 16, fontWeight: "600", color: PRIMARY },

  row: { flexDirection: "row", gap: 12 },

  label: { fontSize: 11, color: TEXT_SECONDARY, marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inputText: { fontSize: 14, color: TEXT_PRIMARY },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  primaryBtnText: { color: "#fff", fontWeight: "600" },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  totalCard: { marginBottom: 12 },
  totalLabel: { fontSize: 13, color: TEXT_SECONDARY },
  totalValue: {
    fontSize: 32,
    fontWeight: "700",
    color: PRIMARY,
  },

  miniCard: { flex: 1 },
  miniValue: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  miniLabel: { fontSize: 12, color: TEXT_SECONDARY, marginBottom: 8 },

  progress: {
    height: 6,
    backgroundColor: PROGRESS_BG,
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: PROGRESS_FILL,
    borderRadius: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "85%",
  },

  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },

  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pickerItem: { paddingVertical: 8, textAlign: "center" },
  pickerActive: { color: PRIMARY, fontWeight: "700" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sectionHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 12,
},
totalRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

totalIcon: {
  width: 42,
  height: 42,
  borderRadius: 12,
//   backgroundColor: "#F1F5F9",
  justifyContent: "center",
  alignItems: "center",
},


  modalCancel: { color: TEXT_SECONDARY },
  modalConfirm: { color: PRIMARY, fontWeight: "600" },
});
