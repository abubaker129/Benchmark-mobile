import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
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

export default function Instructions() {
  const navigation = useNavigation();
  const route = useRoute();
  const [instructions, setInstructions] = useState("");

  const handleContinue = () => {
    // Navigate to PropertyReview with instructions data
    navigation.navigate("PropertyReview", {
      ...route.params,
      instructions,
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
      <StepProgress current={4} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* INSTRUCTIONS CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special Instructions</Text>
          <Text style={styles.cardSubtitle}>Any additional notes for this order</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instructions (optional)</Text>
            <TextInput
              multiline
              numberOfLines={8}
              placeholder="Enter any special requirements, preferences, or notes for the team..."
              value={instructions}
              onChangeText={setInstructions}
              style={styles.textarea}
              placeholderTextColor={TEXT_SECONDARY}
            />
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
            style={styles.continueButton}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  formGroup: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  textarea: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT_PRIMARY,
    textAlignVertical: "top",
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
});
