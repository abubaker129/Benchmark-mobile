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
import { searchInProcessOrders } from "../../api/orders.api";
import { mapOrderFromApi } from "../../utils/orderMapper";

// import { searchInProcessOrders } from "../../api/orders"; // later

const COLORS = {
  PRIMARY: "#0c4a6e",
  BG: "#ffffff",
  CARD_BG: "#f3f6fb",
  TEXT_PRIMARY: "#111827",
  TEXT_SECONDARY: "#6b7280",
  BORDER: "#e5e7eb",
};

export default function InProcessOrders() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]); // backend will fill this
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

 const fetchOrders = async (query) => {
  setLoading(true);

  try {
    const res = await searchInProcessOrders(query);

    const list = Array.isArray(res?.data) ? res.data : [];
    const mappedOrders = list.map(mapOrderFromApi);

    setOrders(mappedOrders);
  } catch (e) {
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
                  placeholder="Search address or Order ID"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearchChange}
                />
                {loading && (
                  <ActivityIndicator size="small" color={COLORS.TEXT_SECONDARY} />
                )}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.title}>In Process Orders</Text>
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
                  name="search-outline"
                  size={40}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptySub}>
                  Try searching by address or Order ID.
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
