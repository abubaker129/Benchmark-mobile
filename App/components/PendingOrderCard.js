import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const safe = (v) => (v === undefined || v === null || v === "" ? "N/A" : v);

export default function PendingOrderCard({
  order,
  onViewFiles,
  onReUpload,
}) {
  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.address} numberOfLines={2}>
          {safe(order?.address)}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pending</Text>
        </View>
      </View>

      {/* META */}
      <View style={styles.row}>
        <Meta label="Order Type" value={safe(order?.type)} />
        <Meta label="Client Code" value={safe(order?.client_code)} />
      </View>

      <View style={styles.row}>
        <Meta label="Order Date" value={safe(order?.order_date)} />
        <Meta label="Pending Since" value={safe(order?.pending_time)} />
      </View>

      {/* PENDING REASON */}
      <View style={styles.reasonRow}>
        <Text style={styles.reasonLabel}>Pending Reason</Text>
        <View style={styles.reasonBadge}>
          <Text style={styles.reasonText}>
            {safe(order?.pending_reason)}
          </Text>
        </View>
      </View>

      {/* NOTES */}
      <Text style={styles.notes}>
        <Text style={styles.notesLabel}>Notes: </Text>
        {safe(order?.notes)}
      </Text>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewBtn} onPress={onViewFiles}>
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.btnText}>View Files</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={onReUpload}>
          <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
          <Text style={styles.btnText}>Re-Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Meta({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f3f6fb",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },

  metaLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 3,
  },

  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  reasonRow: {
    marginBottom: 10,
  },

  reasonLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },

  reasonBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  reasonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  notes: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 12,
  },

  notesLabel: {
    fontWeight: "700",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  viewBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  uploadBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
