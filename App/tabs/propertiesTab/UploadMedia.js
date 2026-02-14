import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import StepProgress from "./StepProgress";
import Colors from "../../constants/colors";

const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;

export default function UploadMedia() {
  const navigation = useNavigation();
  const route = useRoute();

  // Expecting `selectedItems` passed as array of { id, name, price }
  const selectedItems = route.params?.selectedItems || [];

  // quantities keyed by item id
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    selectedItems.forEach((it) => (map[it.id] = 0));
    return map;
  });

  const [links, setLinks] = useState(() => {
    const map = {};
    selectedItems.forEach((it) => (map[it.id] = ""));
    return map;
  });

  // mapping to indicate reuse of media from another selected item (id or null)
  const [useSame, setUseSame] = useState(() => {
    const map = {};
    selectedItems.forEach((it) => (map[it.id] = null));
    return map;
  });

  const parseNumeric = (priceStr) => {
    if (!priceStr) return 0;
    const m = priceStr.match(/[0-9,.]+/);
    if (!m) return 0;
    return parseFloat(m[0].replace(/,/g, "")) || 0;
  };

  const subtotalById = useMemo(() => {
    const map = {};
    selectedItems.forEach((it) => {
      const q = quantities[it.id] || 0;
      const p = parseNumeric(it.price);
      map[it.id] = q * p;
    });
    return map;
  }, [quantities, selectedItems]);

  const updateQty = (id, value) => {
    const n = Math.max(0, parseInt(String(value) || "0", 10) || 0);
    setQuantities((prev) => ({ ...prev, [id]: n }));
  };

  const toggleUseSame = (id, otherId) => {
    setUseSame((prev) => ({ ...prev, [id]: prev[id] === otherId ? null : otherId }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("PropertiesHome")}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back to Properties</Text>
        </TouchableOpacity>
      </View>

      {/* STEP PROGRESS */}
      <StepProgress current={3} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introCard}>
          <Text style={styles.title}>Upload Media</Text>
          <Text style={styles.subtitle}>Add files or links for each selected service</Text>
        </View>

        {selectedItems.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No services selected. Go back and choose services.</Text>
          </View>
        )}

        {selectedItems.map((it) => (
          <View key={it.id} style={styles.serviceCard}>
            {/* Service name at the top */}
            <Text style={styles.serviceName}>{it.name}</Text>

            {/* Quantity and Price row */}
            <View style={styles.qtyPriceRow}>
              <View style={styles.qtyWrap}>
                <Text style={styles.qtyLabel}>Quantity of Images</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={String(quantities[it.id] || 0)}
                  onChangeText={(v) => updateQty(it.id, v)}
                  style={styles.qtyInput}
                />
              </View>

              <View style={styles.priceWrap}>
                <Text style={styles.priceAmount}>${(subtotalById[it.id] || 0).toFixed(2)}</Text>
                <Text style={styles.pricePer}>{it.price}</Text>
              </View>
            </View>

            {/** Optional reuse checkbox: show other selected items to reuse media from */}
            {selectedItems.filter((s) => s.id !== it.id).length > 0 && (
              <View style={styles.useSameRow}>
                <Text style={styles.useSameLabel}>Use same media as:</Text>
                {/* for now we show the first other item as a selectable option */}
                {(() => {
                  const other = selectedItems.find((s) => s.id !== it.id);
                  return (
                    <TouchableOpacity
                      style={styles.useSameOption}
                      onPress={() => toggleUseSame(it.id, other.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radio, useSame[it.id] === other.id && styles.radioSelected]}>
                        {useSame[it.id] === other.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={styles.useSameOptionText}>{other.name}</Text>
                    </TouchableOpacity>
                  );
                })()}
              </View>
            )}

            <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8}>
              <Ionicons name="cloud-upload-outline" size={28} color={TEXT_SECONDARY} />
              <Text style={styles.uploadText}>Click to upload files</Text>
              <Text style={styles.uploadHint}>Images, videos, ZIP, RAR</Text>
            </TouchableOpacity>

            <View style={styles.linkRow}>
              <TextInput
                placeholder="Paste link (Dropbox, Drive, WeTransfer, etc.)"
                value={links[it.id]}
                onChangeText={(v) => setLinks((p) => ({ ...p, [it.id]: v }))}
                style={styles.linkInput}
              />
              <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Instructions", { ...route.params, upload: { quantities, links, useSame } })}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  introCard: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "900", color: TEXT_PRIMARY },
  subtitle: { fontSize: 15, color: TEXT_SECONDARY, marginTop: 8, fontWeight: "500" },
  emptyCard: { 
    padding: 24, 
    backgroundColor: CARD_BG, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: BORDER,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  emptyText: { color: TEXT_SECONDARY },
  serviceCard: { 
    backgroundColor: CARD_BG, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: BORDER, 
    padding: 18, 
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  serviceName: { fontSize: 17, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 14, flexWrap: "wrap" },
  qtyPriceRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 14 },
  qtyWrap: { flex: 1 },
  qtyLabel: { fontSize: 12, color: TEXT_SECONDARY, marginBottom: 8, fontWeight: "700" },
  qtyInput: { height: 40, backgroundColor: "#f8fafc", borderRadius: 10, paddingHorizontal: 12, fontWeight: "800", color: TEXT_PRIMARY, borderWidth: 1, borderColor: BORDER, fontSize: 15 },
  priceWrap: { alignItems: "flex-end", justifyContent: "flex-start" },
  priceAmount: { fontSize: 18, fontWeight: "900", color: PRIMARY },
  pricePer: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 6, fontWeight: "600" },
  uploadBox: { 
    borderWidth: 2, 
    borderStyle: "dashed", 
    borderColor: BORDER, 
    borderRadius: 14, 
    padding: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#fafbfc", 
    marginBottom: 14 
  },
  uploadText: { color: TEXT_PRIMARY, marginTop: 10, fontWeight: "700", fontSize: 15 },
  uploadHint: { color: TEXT_SECONDARY, fontSize: 13, marginTop: 6, fontWeight: "500" },
  linkRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  linkInput: { 
    flex: 1, 
    height: 44, 
    borderRadius: 10, 
    backgroundColor: "#f8fafc", 
    paddingHorizontal: 14, 
    borderWidth: 1, 
    borderColor: BORDER,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  addButton: { 
    marginLeft: 10, 
    paddingHorizontal: 16, 
    height: 44, 
    borderRadius: 10, 
    backgroundColor: PRIMARY, 
    alignItems: "center", 
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  addButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  useSameRow: { marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap", gap: 10 },
  useSameLabel: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: "600" },
  useSameOption: { flexDirection: "row", alignItems: "center", flex: 1, flexWrap: "wrap" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: BORDER, alignItems: "center", justifyContent: "center", marginRight: 8 },
  radioSelected: { borderColor: PRIMARY },
  radioInner: { width: 11, height: 11, borderRadius: 5, backgroundColor: PRIMARY },
  useSameOptionText: { color: TEXT_PRIMARY, fontWeight: "700", flexWrap: "wrap", flex: 1, fontSize: 14 },
  buttonRow: { flexDirection: "row", gap: 12 },
  backButton: { 
    flex: 1, 
    height: 52, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: BORDER, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#f9fafb",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  backButtonText: { color: TEXT_SECONDARY, fontWeight: "800", fontSize: 16 },
  continueButton: { 
    flex: 1, 
    height: 52, 
    borderRadius: 14, 
    backgroundColor: PRIMARY, 
    alignItems: "center", 
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 4 },
    }),
  },
  continueButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
