import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";

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
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 4 },
    }),
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    alignItems: "flex-start",
  },

  address: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginRight: 12,
  },

  statusPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
  },

  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: "600",
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  link: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  btn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },

  btnDisabled: {
    backgroundColor: Colors.border,
  },

  btnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
});
