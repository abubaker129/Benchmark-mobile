import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";

import FloatingInput from "../components/FloatingInput";
import Loader from "../components/Loader";

/* ===================== VALIDATION ===================== */

const ForgetPassSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

/* ===================== SCREEN ===================== */

export default function ForgetPass({ navigation }) {
  const insets = useSafeAreaInsets();

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const compact = useSharedValue(0);
  const overlay = useSharedValue(0);

  /* ===================== ANIMATIONS ===================== */

  const startLoadingAnim = () => {
    compact.value = withTiming(1, { duration: 220 });
    overlay.value = withTiming(1, { duration: 220 });
  };

  const stopLoadingAnim = () => {
    overlay.value = withTiming(0, { duration: 200 });
    compact.value = withTiming(0, { duration: 220 });
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(compact.value, [0, 1], [1, 0.96]) },
      { translateY: interpolate(compact.value, [0, 1], [0, -18]) },
    ],
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(overlay.value, [0, 1], [120, 0]) },
    ],
    opacity: overlay.value,
  }));

  /* ===================== SUBMIT HANDLER ===================== */

  const handleSubmitEmail = async (values) => {
    if (submitting) return;

    setServerError("");

    try {
      setSubmitting(true);
      startLoadingAnim();

      // API IMPLEMENTATION REMOVED (start fresh with new endpoints)
      // Example later:
      // await forgotPasswordApi(values.email);

    } catch (err) {
      setServerError(err?.message || "Something went wrong. Please try again.");
    } finally {
      stopLoadingAnim();
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../assets/images/bg.png")}
        resizeMode="cover"
        style={styles.bg}
      >
        <View style={styles.bgOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentWrapper}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
                <View style={styles.spacer} />

                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={ForgetPassSchema}
                  onSubmit={handleSubmitEmail}
                >
                  {({
                    handleChange,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    isValid,
                  }) => (
                    <>
                      <Animated.View
                        style={[
                          styles.cardWrap,
                          { paddingBottom: Math.max(insets.bottom, 22) },
                          cardAnimStyle,
                        ]}
                      >
                        <Text style={styles.brand}>Benchmark</Text>
                        <Text style={styles.head}>Forgot Password</Text>
                        <Text style={styles.subhead}>
                          Enter your email to receive a password reset link.
                        </Text>

                        {/* EMAIL */}
                        <FloatingInput
                          label="Email Address"
                          value={values.email}
                          onChangeText={(v) => {
                            setServerError("");
                            handleChange("email")(v);
                          }}
                          keyboardType="email-address"
                          error={touched.email && errors.email}
                        />
                        {touched.email && errors.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        {/* SERVER ERROR */}
                        {serverError ? (
                          <Text style={styles.serverError}>{serverError}</Text>
                        ) : null}

                        <Pressable
                          onPress={handleSubmit}
                          disabled={!isValid || submitting}
                          style={[
                            styles.actionBtn,
                            (!isValid || submitting) && styles.disabledBtn,
                          ]}
                        >
                          <Text style={styles.actionBtnText}>
                            Send Reset Link
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => navigation.goBack()}
                          disabled={submitting}
                          style={styles.backWrap}
                        >
                          <Text style={styles.backText}>Back to Login</Text>
                        </Pressable>
                      </Animated.View>

                      {/* LOADING OVERLAY */}
                      <Animated.View
                        pointerEvents={submitting ? "auto" : "none"}
                        style={[styles.overlay, overlayAnimStyle]}
                      >
                        <Text style={styles.overlayTitle}>Submitting…</Text>
                        <Loader size={28} />
                      </Animated.View>
                    </>
                  )}
                </Formik>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: "#0c4a6e" 
  },
  bg: { 
    ...StyleSheet.absoluteFillObject 
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,74,110,0.12)",
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  contentWrapper: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  spacer: {
    flex: 1,
    minHeight: 100,
  },

  cardWrap: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 22,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  brand: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#0c4a6e" 
  },
  head: { 
    fontSize: 18, 
    fontWeight: "800", 
    marginTop: 8 
  },
  subhead: { 
    fontSize: 13, 
    opacity: 0.6, 
    marginBottom: 14 
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
  },

  serverError: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 10,
    textAlign: "center",
  },

  actionBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0c4a6e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  disabledBtn: { 
    opacity: 0.6 
  },

  actionBtnText: { 
    color: "#fff", 
    fontWeight: "800" 
  },

  backWrap: {
    alignSelf: "center",
    marginTop: 14,
  },

  backText: {
    color: "#0c4a6e",
    fontWeight: "800",
    fontSize: 13,
    opacity: 0.9,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  overlayTitle: { 
    fontWeight: "800", 
    color: "#0c4a6e",
    marginRight: 25 
  },
});
