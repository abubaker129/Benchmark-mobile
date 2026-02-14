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
  KeyboardAvoidingView,
  Keyboard,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import StepProgress from "./StepProgress";
import { Formik } from "formik";
import * as Yup from "yup";
import Colors from "../../constants/colors";

const PRIMARY = Colors.primary;
const BG = Colors.background;
const CARD_BG = Colors.cardBg;
const TEXT_PRIMARY = Colors.text;
const TEXT_SECONDARY = Colors.textSecondary;
const BORDER = Colors.border;

/* VALIDATION SCHEMA */
const PropertySchema = Yup.object().shape({
  propertyName: Yup.string()
    .required("Property name is required")
    .min(3, "Property name must be at least 3 characters"),
  streetAddress: Yup.string(),
  propertySize: Yup.string()
    .required("Property size is required")
    .matches(/^\d+$/, "Property size must be a number"),
});

export default function AddProperty() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProperty = async (values) => {
    try {
      setIsSubmitting(true);
      Keyboard.dismiss();

      // TODO: Make API call here

      // Navigate to services selection
      setTimeout(() => {
        navigation.navigate("PropertyServices", values);
      }, 500);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back to Properties</Text>
        </TouchableOpacity>
      </View>

      {/* STEP PROGRESS */}
      <StepProgress current={1} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* FORM CARD */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Property Information</Text>
            <Text style={styles.formSubtitle}>Enter basic property details</Text>

            <Formik
              initialValues={{
                propertyName: "",
                streetAddress: "",
                propertySize: "",
              }}
              validationSchema={PropertySchema}
              onSubmit={handleAddProperty}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  {/* PROPERTY NAME */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                      Property Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.propertyName && errors.propertyName
                          ? styles.inputError
                          : null,
                      ]}
                      placeholder="e.g., Sunset Vista Estate, 123 Main St"
                      placeholderTextColor="#9ca3af"
                      value={values.propertyName}
                      onChangeText={handleChange("propertyName")}
                      onBlur={handleBlur("propertyName")}
                    />
                    {touched.propertyName && errors.propertyName && (
                      <Text style={styles.errorText}>{errors.propertyName}</Text>
                    )}
                  </View>

                  {/* STREET ADDRESS */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Street Address (optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1234 Main Street"
                      placeholderTextColor="#9ca3af"
                      value={values.streetAddress}
                      onChangeText={handleChange("streetAddress")}
                      onBlur={handleBlur("streetAddress")}
                    />
                  </View>

                  {/* PROPERTY SIZE */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                      Property Size (Sq. Ft.) <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.propertySize && errors.propertySize
                          ? styles.inputError
                          : null,
                      ]}
                      placeholder="e.g. 2500"
                      placeholderTextColor="#9ca3af"
                      value={values.propertySize}
                      onChangeText={handleChange("propertySize")}
                      onBlur={handleBlur("propertySize")}
                      keyboardType="numeric"
                    />
                    <Text style={styles.hint}>
                      Required for sqft-based pricing packages.
                    </Text>
                    {touched.propertySize && errors.propertySize && (
                      <Text style={styles.errorText}>{errors.propertySize}</Text>
                    )}
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
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                      style={[
                        styles.continueButton,
                        isSubmitting && styles.buttonDisabled,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.continueButtonText}>
                        {isSubmitting ? "Loading..." : "Continue"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  stepContainer: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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

  stepNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  stepLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },

  stepTitle: {
    fontSize: 18,
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

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },

  required: {
    color: "#DC2626",
  },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT_PRIMARY,
    backgroundColor: "#fbfdff",
  },

  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },

  hint: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 6,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
