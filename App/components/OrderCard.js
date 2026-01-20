import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const safe = (v) =>
  v === undefined || v === null || v === "" ? "N/A" : v;

export default function OrderCard({
  order,
  onViewFiles,
  onDownload,
  onAction,
}) {
  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.rowBetween}>
        <Text style={styles.address} numberOfLines={2}>
          {safe(order.addressOrderId)}
        </Text>

        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {safe(order.status)}
          </Text>
        </View>
      </View>

      {/* META */}
      <View style={styles.metaRow}>
        <Meta label="Order Type" value={order.orderType} />
        <Meta label="Code" value={order.code} />
      </View>

      <View style={styles.metaRow}>
        <Meta label="Preference" value={order.preference} />
      </View>

      <View style={styles.metaRow}>
        <Meta label="Order Time" value={order.orderTime} />
        <Meta label="Done Time" value={order.doneTime} />
      </View>

      <View style={styles.metaRow}>
        <MetaLink label="Original Link" value={order.originalLink} />
        <MetaLink label="Final Files Link" value={order.finalFilesLink} />
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <ActionBtn
          label="View Files"
          icon="eye-outline"
          disabled={!order.originalFilesAvailable}
          onPress={onViewFiles}
        />

        <ActionBtn
          label="Download"
          icon="download-outline"
          disabled={!order.finalFilesAvailable}
          onPress={onDownload}
        />

        {onAction && (
          <ActionBtn
            label="Action"
            icon="create-outline"
            onPress={onAction}
          />
        )}
      </View>
    </View>
  );
}

/* SUB COMPONENTS */

function Meta({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{safe(value)}</Text>
    </View>
  );
}

function MetaLink({ label, value }) {
  const isNA = safe(value) === "N/A";
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, !isNA && styles.link]}>
        {safe(value)}
      </Text>
    </View>
  );
}

function ActionBtn({ label, icon, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        disabled && styles.btnDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={disabled ? "#6b7280" : "#fff"}
      />
      <Text
        style={[
          styles.btnText,
          disabled && { color: "#6b7280" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f3f6fb",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  rowBetween: {
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

  statusPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },

  label: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  link: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },

  btn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#0c4a6e",
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  btnDisabled: {
    backgroundColor: "#E5E7EB",
  },

  btnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
});
