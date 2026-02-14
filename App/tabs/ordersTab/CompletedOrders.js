import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import OrderCard from "../../components/OrderCard";
import { searchCompletedOrders } from "../../api/orders.api";
import { mapOrderFromApi } from "../../utils/orderMapper";
import Colors from "../../constants/colors";

const COLORS = {
  PRIMARY: Colors.primary,
  BG: Colors.background,
  CARD_BG: Colors.cardBg,
  TEXT_PRIMARY: Colors.text,
  TEXT_SECONDARY: Colors.textSecondary,
  BORDER: Colors.border,
};

export default function CompletedOrders() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  const fetchOrders = async (query) => {
    setLoading(true);

    try {
      const res = await searchCompletedOrders(query);
      const list = Array.isArray(res?.data) ? res.data : [];
      setOrders(list.map(mapOrderFromApi));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearch(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchOrders(text);
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={orders}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : String(index)
          }
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
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
                  placeholder="Search completed orders"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearchChange}
                />
                {loading && (
                  <ActivityIndicator size="small" color={COLORS.TEXT_SECONDARY} />
                )}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.title}>Completed Orders</Text>
                <Text style={styles.count}>{orders.length}</Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onViewFiles={() => {}}
              onDownload={() => {}}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={40}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.emptyTitle}>No Completed Orders</Text>
                <Text style={styles.emptySub}>
                  Completed orders will appear here.
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BG },
  list: { padding: 16, paddingBottom: 32 },

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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },

  count: {
    backgroundColor: COLORS.CARD_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
});
