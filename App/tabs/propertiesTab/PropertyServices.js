import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import StepProgress from "./StepProgress";
import Colors from "../../constants/colors";

const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;

/* SERVICES DATA */
const SERVICES_DATA = [
  {
    id: "floor-plans",
    category: "Floor Plans",
    items: [
      { id: "2d-bw", name: "2D Floor Plan (Black & White)", price: "$4.5" },
      { id: "2d-colored", name: "2D Floor Plan (Colored / Branded)", price: "$5.5" },
      { id: "3d-interactive", name: "3D / Interactive Floor Plan", price: "$12.5" },
      { id: "site-plans", name: "Site Plans", price: "$18" },
    ],
  },
  {
    id: "image-services",
    category: "Image Services",
    items: [
      { id: "photo-qa", name: "Photography QA / Enhancement", price: "$0.65/image" },
      { id: "virtual-staging", name: "Virtual Staging", price: "$18/image" },
      { id: "object-removal", name: "Object Removal", price: "$3/image" },
      { id: "360-tours", name: "360 Virtual Tours", price: "$12" },
      { id: "cgi-artist", name: "CGIs/Artist Impressions", price: "$150/image" },
    ],
  },
  {
    id: "matterport",
    category: "Matterport / 3D Services",
    items: [
      { id: "matterport-floor", name: "Matterport Floor Plan Processing", price: "$5.75" },
      { id: "matterport-enhancement", name: "Matterport Image Enhancement", price: "$1.2/image" },
      { id: "matterport-qa", name: "Matterport Tours QA", price: "$5" },
      { id: "virtual-staging-mp", name: "Virtual Staging Matterport", price: "$25" },
    ],
  },
  {
    id: "video",
    category: "Video / Marketing",
    items: [
      { id: "walkthrough-editing", name: "Walkthrough Video Editing", price: "$12" },
      { id: "video-qa", name: "Video QA", price: "$4.5" },
    ],
  },
];

export default function PropertyServices() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price whenever selected services change
  useEffect(() => {
    const findPrice = (id) => {
      for (const group of SERVICES_DATA) {
        const item = group.items.find((i) => i.id === id);
        if (item) return item.price;
      }
      return null;
    };

    const parseNumeric = (priceStr) => {
      if (!priceStr) return 0;
      const m = priceStr.match(/[0-9,.]+/);
      if (!m) return 0;
      return parseFloat(m[0].replace(/,/g, "")) || 0;
    };

    const total = selectedServices.reduce((acc, id) => {
      const p = findPrice(id);
      return acc + parseNumeric(p);
    }, 0);

    setTotalPrice(total);
  }, [selectedServices]);

  const toggleService = (itemId) => {
    setSelectedServices((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    // Build selected item objects to pass to the upload step
    const findItem = (id) => {
      for (const group of SERVICES_DATA) {
        const item = group.items.find((i) => i.id === id);
        if (item) return item;
      }
      return null;
    };

    const selectedItems = selectedServices.map((id) => findItem(id)).filter(Boolean);

    // Navigate to Upload Media step (step 3)
    navigation.navigate("UploadMedia", {
      ...route.params,
      selectedItems,
    });
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
      <StepProgress current={2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FORM CARD */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Select Services</Text>
          <Text style={styles.formSubtitle}>Choose the services you need</Text>

          {/* SERVICES GROUPS */}
          {SERVICES_DATA.map((group) => (
            <View key={group.id} style={styles.serviceGroup}>
              <Text style={styles.groupTitle}>{group.category}</Text>

              {group.items.map((item) => (
                <ServiceItem
                  key={item.id}
                  item={item}
                  isSelected={selectedServices.includes(item.id)}
                  onToggle={() => toggleService(item.id)}
                />
              ))}
            </View>
          ))}
        </View>

        {/* FOOTER INFO */}
        <View style={styles.footerInfo}>
          <Text style={styles.selectedCount}>
            {selectedServices.length} service(s) selected
          </Text>
          <View style={styles.totalPrice}>
            <Text style={styles.totalLabel}>
              Total: <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
            </Text>
            <Text style={styles.grossLabel}>(Gross: ${totalPrice.toFixed(2)})</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            style={[
              styles.continueButton,
              selectedServices.length === 0 && styles.buttonDisabled,
            ]}
            disabled={selectedServices.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceItem({ item, isSelected, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
      </View>
      <Text style={styles.servicePrice}>{item.price}</Text>
    </TouchableOpacity>
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

  stepContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  stepNav: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "600",
  },

  stepCenterContent: {
    alignItems: "center",
  },

  stepCenterContentOnly: {
    alignItems: "center",
    alignSelf: "center",
  },

  stepCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  stepLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 3 },
    }),
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },

  formSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 20,
  },

  serviceGroup: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  groupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
    backgroundColor: "#fbfdff",
  },

  serviceItemSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: PRIMARY,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  serviceContent: {
    flex: 1,
  },

  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },

  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY,
  },

  footerInfo: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  selectedCount: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },

  totalPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  totalAmount: {
    color: PRIMARY,
  },

  grossLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },

  backButtonText: {
    color: TEXT_SECONDARY,
    fontWeight: "700",
    fontSize: 16,
  },

  continueButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
