import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StepProgress from "./StepProgress";
import { useNavigation, useRoute } from "@react-navigation/native";
import Colors from "../../constants/colors";

const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;
const SUCCESS = Colors.success;

export default function PropertyReview() {
  const navigation = useNavigation();
  const route = useRoute();

  const selectedItems = route.params?.selectedItems || [];
  const quantities = route.params?.upload?.quantities || {};

  const parseNumeric = (priceStr) => {
    if (!priceStr) return 0;
    const m = priceStr.match(/[0-9,.]+/);
    if (!m) return 0;
    return parseFloat(m[0].replace(/,/g, "")) || 0;
  };

  // Build line items with quantities
  const lineItems = useMemo(() => {
    return selectedItems.map((item) => {
      const qty = quantities[item.id] || 0;
      const unitPrice = parseNumeric(item.price);
      const subtotal = qty * unitPrice;
      return {
        id: item.id,
        name: item.name,
        qty,
        unitPrice,
        subtotal,
        isFree: Math.random() > 0.5, // Mock: some items marked as free
      };
    });
  }, [selectedItems, quantities]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.subtotal, 0),
    [lineItems]
  );

  const freeCreditsApplied = Math.min(subtotal, 59); // Mock: -$59 free credits
  const amountToCharge = Math.max(0, subtotal - freeCreditsApplied);

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
      <StepProgress current={5} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* REVIEW CARD */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Review & Submit</Text>
          <Text style={styles.reviewSubtitle}>Review your order before submitting</Text>

          {/* PROPERTY SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property</Text>
            <Text style={styles.propertyValue}>{route.params?.propertyName || "N/A"}</Text>
          </View>

          {/* SELECTED SERVICES SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Services</Text>

            {lineItems.length === 0 ? (
              <Text style={styles.noServices}>No services selected</Text>
            ) : (
              lineItems.map((item) => (
                <View key={item.id} style={styles.lineItem}>
                  <View style={styles.lineItemLeft}>
                    <Text style={styles.lineItemName}>{item.name}</Text>
                    {item.isFree && <Text style={styles.freeBadge}>FREE</Text>}
                    <Text style={styles.lineItemQty}>
                      {item.qty} items @ ${item.unitPrice.toFixed(2)}/ea
                    </Text>
                  </View>
                  <View style={styles.lineItemRight}>
                    <Text style={[styles.lineItemTotal, item.isFree && styles.freePrice]}>
                      ${item.subtotal.toFixed(2)}
                    </Text>
                    {item.isFree && <Text style={styles.freeLabel}>FREE</Text>}
                  </View>
                </View>
              ))
            )}

            {/* PRICING BREAKDOWN */}
            <View style={styles.pricingBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>${subtotal.toFixed(2)}</Text>
              </View>

              <View style={[styles.breakdownRow, styles.creditRow]}>
                <Text style={styles.creditLabel}>Free Credits Applied</Text>
                <Text style={styles.creditAmount}>
                  -{freeCreditsApplied} unit(s) (-${freeCreditsApplied.toFixed(2)})
                </Text>
              </View>

              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Amount to Charge</Text>
                <Text style={styles.totalAmount}>${amountToCharge.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            alert("Order submitted successfully!");
            navigation.popToTop();
          }}
          style={styles.submitButton}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>Submit Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  reviewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 5 },
    }),
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 18,
    fontWeight: "500",
  },
  section: {
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: TEXT_SECONDARY,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  propertyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  noServices: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  lineItemLeft: {
    flex: 1,
  },
  lineItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  freeBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: SUCCESS,
    marginBottom: 6,
  },
  lineItemQty: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
  lineItemRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  lineItemTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 6,
  },
  freePrice: {
    textDecorationLine: "line-through",
    color: TEXT_SECONDARY,
  },
  freeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: SUCCESS,
  },
  pricingBreakdown: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  breakdownLabel: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: "700",
  },
  breakdownValue: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "800",
  },
  creditRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  creditLabel: {
    fontSize: 15,
    color: SUCCESS,
    fontWeight: "700",
  },
  creditAmount: {
    fontSize: 15,
    color: SUCCESS,
    fontWeight: "800",
  },
  totalRow: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: PRIMARY,
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
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
  backButtonText: {
    color: TEXT_SECONDARY,
    fontWeight: "800",
    fontSize: 16,
  },
  submitButton: {
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
  submitButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
