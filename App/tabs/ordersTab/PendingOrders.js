import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PendingOrderCard from "../../components/PendingOrderCard";

export default function PendingOrders() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]); // backend later
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={orders}
        keyExtractor={(item, index) =>
          item?.id ? String(item.id) : String(index)
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#6b7280" />
              <TextInput
                placeholder="Search Order"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
              {loading && <ActivityIndicator size="small" />}
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Pending Orders</Text>
              <Text style={styles.count}>{orders.length}</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <PendingOrderCard
            order={item}
            onViewFiles={() => {}}
            onReUpload={() => {}}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={40} color="#6b7280" />
              <Text style={styles.emptyTitle}>No Pending Orders</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  list: { padding: 16, paddingBottom: 32 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6fb",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  count: {
    backgroundColor: "#f3f6fb",
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
});
